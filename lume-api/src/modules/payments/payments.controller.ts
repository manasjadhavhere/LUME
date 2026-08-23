import { Request, Response, NextFunction } from 'express';
import * as PaymentService from './payments.service';
import { prisma } from '../../lib/prisma';
import { createError } from '../auth/auth.service';

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

    if (booking.status !== 'ACCEPTED') {
      res.status(400).json({ success: false, message: 'Booking is not ready for payment' });
      return;
    }

    const amount = booking.totalPaid;
    if (amount <= 0) {
      res.status(400).json({ success: false, message: 'Invalid booking amount' });
      return;
    }

    const receipt = `rcpt_${booking.id}_${Date.now()}`;
    
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

    const order = await PaymentService.createOrder(amount, receipt);
    res.json({ success: true, data: order });
  } catch (err: any) { 
    console.error('Razorpay Create Order Error:', err);
    res.status(500).json({ success: false, message: err.error?.description || err.message || 'Razorpay order creation failed' });
  }
}

export async function createPaymentOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { amount, receiptId } = req.body;
    
    if (!amount || amount <= 0) {
      res.status(400).json({ success: false, message: 'Invalid amount' });
      return;
    }

    // Default receipt ID if not provided
    const receipt = receiptId || `rcpt_${Date.now()}`;
    
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
        // Update booking status to CONFIRMED
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'CONFIRMED' }
        });
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
