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
    const order = await PaymentService.createOrder(amount, receipt);
    
    res.json({ success: true, data: order });
  } catch (err) { 
    console.error('Razorpay Create Order Error:', err);
    next(err); 
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
