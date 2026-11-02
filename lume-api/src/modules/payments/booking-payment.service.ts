import prisma from '../../lib/prisma';
import { createError } from '../../middleware/errorHandler';

interface PaymentInput {
  bookingId: string;
  paymentType: string;
  orderId: string;
  paymentId: string;
}

/** Commit the receipt and booking together; serialize competing callbacks. */
export async function recordBookingPayment(clientId: string, input: PaymentInput) {
  if (!['ADVANCE', 'FULL', 'REMAINING'].includes(input.paymentType)) {
    throw createError('Invalid paymentType', 400);
  }
  return prisma.$transaction(async tx => {
    const booking = await tx.booking.findUnique({ where: { id: input.bookingId } });
    if (!booking) throw createError('Booking not found', 404);
    if (booking.clientId !== clientId) throw createError('Unauthorized', 403);

    const existing = await tx.paymentRecord.findFirst({ where: { OR: [
      { razorpayPaymentId: input.paymentId }, { razorpayOrderId: input.orderId },
    ] } });
    if (existing) {
      if (existing.bookingId !== booking.id || existing.paymentType !== input.paymentType
        || existing.razorpayOrderId !== input.orderId || existing.razorpayPaymentId !== input.paymentId) {
        throw createError('Payment has already been used', 409);
      }
      return { booking, updatedBooking: booking, paymentRecord: existing, duplicate: true,
        chargedAmount: existing.totalCharged, artistPayout: existing.artistPayout };
    }

    const expectedStatus = input.paymentType === 'REMAINING' ? 'PARTIALLY_PAID' : 'ACCEPTED';
    if (booking.status !== expectedStatus) throw createError('Booking is not ready for this payment', 400);
    const total = Math.round(booking.totalPaid * 118) / 100;
    const half = Math.round(total * 50) / 100;
    const chargedAmount = input.paymentType === 'ADVANCE' ? half
      : input.paymentType === 'FULL' ? total : booking.remainingAmount;
    if (!Number.isFinite(chargedAmount) || chargedAmount <= 0) throw createError('Invalid booking amount', 400);
    const basePortion = input.paymentType === 'FULL' ? booking.totalPaid : booking.totalPaid / 2;
    const gstAmount = basePortion * 0.18;
    const lumeCommission = basePortion * 0.05;
    const artistPayout = basePortion * 0.95;

    const paymentRecord = await tx.paymentRecord.create({ data: {
      bookingId: booking.id, paymentType: input.paymentType,
      razorpayOrderId: input.orderId, razorpayPaymentId: input.paymentId,
      totalCharged: chargedAmount, basePortion, gstAmount, lumeCommission,
      lumeTotal: gstAmount + lumeCommission, artistPayout,
      payoutStatus: 'PENDING', transferStatus: 'PENDING',
    } });
    const updatedBooking = await tx.booking.update({ where: { id: booking.id }, data: {
      status: input.paymentType === 'ADVANCE' ? 'PARTIALLY_PAID' : 'CONFIRMED',
      ...(input.paymentType !== 'REMAINING' ? { paymentType: input.paymentType } : {}),
      advancePaid: input.paymentType === 'REMAINING' ? booking.advancePaid + chargedAmount : chargedAmount,
      remainingAmount: input.paymentType === 'ADVANCE' ? total - chargedAmount : 0,
    } });
    return { booking, updatedBooking, paymentRecord, duplicate: false, chargedAmount, artistPayout };
  }, { isolationLevel: 'Serializable' });
}
