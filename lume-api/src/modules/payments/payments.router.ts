import { Router } from 'express';
import { createPaymentOrder, verifyPayment } from './payments.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// All payment routes require authentication
router.use(authenticate);

// Generate Razorpay Order ID
router.post('/create-order', createPaymentOrder);

// Verify signature from frontend checkout
router.post('/verify', verifyPayment);

export default router;
