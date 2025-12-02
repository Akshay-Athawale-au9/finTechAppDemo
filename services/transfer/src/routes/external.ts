import { Router, Request, Response } from 'express';

const router = Router();

// Internal OTP verification endpoint
router.post('/otp/verify', (req: Request, res: Response) => {
  try {
    const { otp } = req.body;
    
    // In a real implementation, we would verify the OTP against a stored value
    // For now, we'll just simulate a successful verification
    if (otp && otp.length >= 4) {
      res.json({
        success: true,
        message: 'OTP verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP format'
      });
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Internal payment processing endpoint
router.post('/payment/process', (req: Request, res: Response) => {
  try {
    const { amount, accountId } = req.body;
    
    // In a real implementation, we would process the payment
    // For now, we'll just simulate a successful payment
    if (amount && accountId) {
      res.json({
        success: true,
        transactionId: 'txn_' + Date.now(),
        message: 'Payment processed successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Amount and account ID are required'
      });
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as externalRouter };