import { Request, Response, NextFunction } from 'express';
import * as PaymentService from './payments.service';

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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ success: false, message: 'Missing Razorpay parameters' });
      return;
    }

    const isValid = PaymentService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (isValid) {
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (err) { 
    console.error('Razorpay Verify Signature Error:', err);
    next(err); 
  }
}
