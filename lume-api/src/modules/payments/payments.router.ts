import { Router } from 'express';
import { createPaymentOrder, verifyPayment, payBooking, createBookingOrder, verifyBookingPayment } from './payments.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// All payment routes require authentication
router.use(authenticate);

// Legacy routes (kept for backward compat)
router.post('/create-order', createPaymentOrder);
router.post('/pay-booking', payBooking);
router.post('/verify', verifyPayment);

// New split-payment routes (ADVANCE / FULL / REMAINING with GST)
router.post('/create-booking-order', createBookingOrder);
router.post('/verify-booking', verifyBookingPayment);

export default router;
