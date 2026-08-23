import { Router } from 'express';
import { createPaymentOrder, verifyPayment, payBooking } from './payments.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// All payment routes require authentication
router.use(authenticate);

// Generate Razorpay Order ID
router.post('/create-order', createPaymentOrder);
router.post('/pay-booking', payBooking);

// Verify signature from frontend checkout
router.post('/verify', verifyPayment);

export default router;
