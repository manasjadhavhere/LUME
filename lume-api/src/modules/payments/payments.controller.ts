import { Request, Response, NextFunction } from 'express';
import * as PaymentService from './payments.service';
import * as RouteService from './razorpay-route.service';
import { prisma } from '../../lib/prisma';
import { createError } from '../../middleware/errorHandler';
import { queueBookingEmail } from '../email/booking-email.service';
import { recordBookingPayment } from './booking-payment.service';
import { randomUUID } from 'crypto';

const GST_RATE = 0.18; // 18% GST
const newReceipt = () => `rcpt_${randomUUID().replace(/-/g, '')}`;

export async function payBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const { bookingId } = req.body;
    
    if (!bookingId) {
      res.status(400).json({ success: false, message: 'Missing bookingId' });
      return;
    }

    // Fetch booking to verify status and amount
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    if (booking.clientId !== req.user?.userId) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (booking.status !== 'ACCEPTED') {
      res.status(400).json({ success: false, message: 'Booking is not ready for payment' });
      return;
    }

    const amount = booking.totalPaid;
    if (!Number.isFinite(amount) || amount <= 0) {
      res.status(400).json({ success: false, message: 'Invalid booking amount' });
      return;
    }

    const receipt = newReceipt();
    
    // MOCK RAZORPAY FOR DEV/TESTING IF DUMMY KEYS ARE USED
    if (process.env.RAZORPAY_KEY_ID === 'rzp_test_YOUR_KEY_ID') {
      return res.json({
        success: true,
        data: {
          id: `order_mock_${Date.now()}`,
          amount: Math.round(amount * 100),
          currency: 'INR',
          receipt,
          status: 'created'
        }
      });
    }

    const order = await PaymentService.createOrder(amount, receipt, { bookingId: booking.id, clientId: booking.clientId, paymentType: 'LEGACY' });
    res.json({ success: true, data: order });
  } catch (err: any) { 
    console.error('Razorpay Create Order Error:', err);
    res.status(500).json({ success: false, message: err.error?.description || err.message || 'Razorpay order creation failed' });
  }
}

export async function createPaymentOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { amount, receiptId } = req.body;
    
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      res.status(400).json({ success: false, message: 'Invalid amount' });
      return;
    }

    // Default receipt ID if not provided
    if (receiptId !== undefined && (typeof receiptId !== 'string' || !receiptId.length || receiptId.length > 40)) {
      res.status(400).json({ success: false, message: 'Receipt must contain 1 to 40 characters' });
      return;
    }
    const receipt = receiptId || newReceipt();
    
    // MOCK RAZORPAY FOR DEV/TESTING IF DUMMY KEYS ARE USED
    if (process.env.RAZORPAY_KEY_ID === 'rzp_test_YOUR_KEY_ID') {
      console.log('Using mock Razorpay order because dummy keys are present');
      return res.json({
        success: true,
        data: {
          id: `order_mock_${Date.now()}`,
          amount: Math.round(amount * 100),
          currency: 'INR',
          receipt,
          status: 'created'
        }
      });
    }

    const order = await PaymentService.createOrder(amount, receipt);
    
    res.json({ success: true, data: order });
  } catch (err: any) { 
    console.error('Razorpay Create Order Error:', err);
    res.status(500).json({ success: false, message: err.error?.description || err.message || 'Razorpay order creation failed' });
  }
}

/**
 * Create a Razorpay order for a booking with ADVANCE or FULL payment.
 * Computes 18% GST on top of the base booking price.
 * - ADVANCE: charges 50% of (base + GST)
 * - FULL: charges 100% of (base + GST)
 */
export async function createBookingOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { bookingId, paymentType } = req.body;

    if (!bookingId || !paymentType) {
      res.status(400).json({ success: false, message: 'Missing bookingId or paymentType' });
      return;
    }

    if (!['ADVANCE', 'FULL', 'REMAINING'].includes(paymentType)) {
      res.status(400).json({ success: false, message: 'paymentType must be ADVANCE, FULL, or REMAINING' });
      return;
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    if (booking.clientId !== req.user?.userId) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // ADVANCE/FULL only allowed when booking is ACCEPTED
    if (paymentType !== 'REMAINING' && booking.status !== 'ACCEPTED') {
      res.status(400).json({ success: false, message: 'Booking is not in ACCEPTED state for payment' });
      return;
    }

    // REMAINING only allowed when booking is PARTIALLY_PAID
    if (paymentType === 'REMAINING' && booking.status !== 'PARTIALLY_PAID') {
      res.status(400).json({ success: false, message: 'No remaining balance found for this booking' });
      return;
    }

    const baseAmount = booking.totalPaid;
    const gstAmount = baseAmount * GST_RATE;
    const totalWithGST = Math.round((baseAmount + gstAmount) * 100) / 100;

    let chargeAmount: number;
    let breakdown: object;

    if (paymentType === 'ADVANCE') {
      chargeAmount = Math.round(totalWithGST * 50) / 100;
      breakdown = {
        base: baseAmount,
        gst: gstAmount,
        totalWithGST,
        chargeAmount,
        label: 'Advance (50%)',
      };
    } else if (paymentType === 'FULL') {
      chargeAmount = totalWithGST;
      breakdown = {
        base: baseAmount,
        gst: gstAmount,
        totalWithGST,
        chargeAmount,
        label: 'Full Payment',
      };
    } else {
      // REMAINING — charge the stored remaining amount
      chargeAmount = booking.remainingAmount;
      breakdown = {
        base: baseAmount,
        gst: gstAmount,
        totalWithGST,
        chargeAmount,
        label: 'Remaining Balance',
      };
    }

    if (!Number.isFinite(chargeAmount) || chargeAmount <= 0) {
      res.status(400).json({ success: false, message: 'No amount to charge' });
      return;
    }

    const receipt = newReceipt();

    // MOCK RAZORPAY FOR DEV/TESTING IF DUMMY KEYS ARE USED
    if (process.env.RAZORPAY_KEY_ID === 'rzp_test_YOUR_KEY_ID') {
      return res.json({
        success: true,
        data: {
          id: `order_mock_${Date.now()}`,
          amount: Math.round(chargeAmount * 100),
          currency: 'INR',
          receipt,
          status: 'created',
        },
        breakdown,
      });
    }

    const order = await PaymentService.createOrder(chargeAmount, receipt, { bookingId: booking.id, clientId: booking.clientId, paymentType });
    res.json({ success: true, data: order, breakdown });
  } catch (err: any) {
    console.error('createBookingOrder Error:', err);
    res.status(500).json({ success: false, message: err.error?.description || err.message || 'Order creation failed' });
  }
}

/**
 * Verify a Razorpay booking payment and update booking payment state.
 * Also creates a PaymentRecord capturing the full commission split:
 *   - lumeTotal   = 23% of base (5% commission + 18% GST collected)
 *   - artistPayout = 95% of base
 */
export async function verifyBookingPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId, paymentType } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ success: false, message: 'Missing Razorpay parameters' });
      return;
    }

    if (!bookingId || !paymentType) {
      res.status(400).json({ success: false, message: 'Missing bookingId or paymentType' });
      return;
    }

    if (!['ADVANCE', 'FULL', 'REMAINING'].includes(paymentType)) {
      res.status(400).json({ success: false, message: 'Invalid paymentType' });
      return;
    }

    // Verify signature (bypass for mock keys)
    let isValid = false;
    if (process.env.RAZORPAY_KEY_ID === 'rzp_test_YOUR_KEY_ID') {
      isValid = true;
    } else {
      isValid = PaymentService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    }

    if (!isValid) {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
      return;
    }

    const targetBooking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!targetBooking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }
    if (targetBooking.clientId !== req.user?.userId) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const total = Math.round(targetBooking.totalPaid * 118) / 100;
    const advance = Math.round(total * 50) / 100;
    const expectedAmount = paymentType === 'FULL' ? total : paymentType === 'ADVANCE' ? advance : total - advance;
    if (process.env.RAZORPAY_KEY_ID !== 'rzp_test_YOUR_KEY_ID'
      && !await PaymentService.verifyBookingOrder(razorpay_order_id, bookingId, targetBooking.clientId, paymentType, expectedAmount)) {
      res.status(400).json({ success: false, message: 'Payment order does not match this booking or is not paid' });
      return;
    }

    const { booking, updatedBooking, paymentRecord, duplicate, artistPayout } = await recordBookingPayment(
      req.user?.userId || '', { bookingId, paymentType, orderId: razorpay_order_id, paymentId: razorpay_payment_id },
    );
    if (duplicate) {
      res.json({ success: true, message: 'Payment already verified' });
      return;
    }

    queueBookingEmail(updatedBooking, paymentType === 'ADVANCE' ? 'ADVANCE_PAID' : 'CONFIRMED');

    // ── Auto-transfer to artist via Razorpay Route ────────────────
    // Only attempt if real Razorpay keys are set (not mock)
    if (RouteService.isRouteEnabled()) {
      // Fetch artist's linked account
      const artistProfile = await prisma.artistProfile.findUnique({
        where: { id: booking.artistId },
        include: { bankAccount: { select: { razorpayLinkedAccountId: true, isLinkedToRazorpay: true } } },
      });

      const linkedAccountId = artistProfile?.bankAccount?.razorpayLinkedAccountId;

      if (linkedAccountId && artistProfile?.bankAccount?.isLinkedToRazorpay) {
        try {
          const transferId = await RouteService.transferToLinkedAccount(
            razorpay_payment_id,
            linkedAccountId,
            artistPayout
          );
          // Update PaymentRecord with transfer success
          await prisma.paymentRecord.update({
            where: { id: paymentRecord.id },
            data: {
              razorpayTransferId: transferId,
              transferStatus: 'SUCCESS',
              payoutStatus: 'COMPLETED',
              payoutCompletedAt: new Date(),
            },
          });
          console.log(`[Route] Auto-transfer successful: ${transferId} → Artist gets ₹${artistPayout}`);
        } catch (transferErr: any) {
          // Log but don't fail the payment — it was still collected successfully
          console.error('[Route] Auto-transfer failed:', transferErr?.message);
          await prisma.paymentRecord.update({
            where: { id: paymentRecord.id },
            data: { transferStatus: 'FAILED' },
          });
        }
      } else {
        // Artist not registered on Razorpay Route yet
        await prisma.paymentRecord.update({
          where: { id: paymentRecord.id },
          data: { transferStatus: 'NOT_LINKED' },
        });
        console.warn(`[Route] Artist ${booking.artistId} has no Razorpay Linked Account — manual payout needed.`);
      }
    }
    // ─────────────────────────────────────────────────────────────

    const messages: Record<string, string> = {
      ADVANCE: 'Advance payment verified. Booking secured!',
      FULL: 'Full payment verified. Booking confirmed!',
      REMAINING: 'Remaining balance paid. Booking confirmed!',
    };

    res.json({ success: true, message: messages[paymentType] });
  } catch (err) {
    console.error('verifyBookingPayment Error:', err);
    next(err);
  }
}

export async function verifyPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ success: false, message: 'Missing Razorpay parameters' });
      return;
    }

    // Since mock signatures aren't real, we should bypass verification if using mock keys
    let isValid = false;
    if (process.env.RAZORPAY_KEY_ID === 'rzp_test_YOUR_KEY_ID') {
       isValid = true;
    } else {
       isValid = PaymentService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    }

    if (isValid) {
      if (bookingId) {
        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking) {
          res.status(404).json({ success: false, message: 'Booking not found' });
          return;
        }
        if (booking.clientId !== req.user?.userId) {
          res.status(403).json({ success: false, message: 'Unauthorized' });
          return;
        }
        if (process.env.RAZORPAY_KEY_ID !== 'rzp_test_YOUR_KEY_ID'
          && !await PaymentService.verifyBookingOrder(razorpay_order_id, bookingId, booking.clientId, 'LEGACY', booking.totalPaid)) {
          res.status(400).json({ success: false, message: 'Payment order does not match this booking or is not paid' });
          return;
        }
        if (booking.status === 'CONFIRMED') {
          res.json({ success: true, message: 'Payment already verified' });
          return;
        }
        if (booking.status !== 'ACCEPTED') {
          res.status(400).json({ success: false, message: 'Booking is not ready for payment' });
          return;
        }
        const updatedBooking = await prisma.$transaction(async tx => {
          const result = await tx.booking.update({ where: { id: bookingId, status: 'ACCEPTED' }, data: { status: 'CONFIRMED' } });
          const artist = await tx.artistProfile.findUniqueOrThrow({ where: { id: result.artistId }, select: { userId: true } });
          const notice = { title: 'Booking payment confirmed', message: result.date.toISOString().slice(0, 10) + ' at ' + result.time + ' IST', type: 'PAYMENT_SUCCESS' };
          await tx.notification.createMany({ data: [
            { ...notice, userId: booking.clientId, link: '/profile' },
            { ...notice, userId: artist.userId, link: '/artist-dashboard/bookings' },
          ] });
          return result;
        });
        queueBookingEmail(updatedBooking, 'CONFIRMED');
      }
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (err) { 
    console.error('Razorpay Verify Signature Error:', err);
    next(err); 
  }
}
