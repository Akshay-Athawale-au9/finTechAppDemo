import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const USE_VIRTUAL = process.env.USE_VIRTUAL === 'true';
const OTP_SERVICE_URL = process.env.OTP_SERVICE_URL || 'http://localhost:8080/otp';
const PAYMENT_GATEWAY_URL = process.env.PAYMENT_GATEWAY_URL || 'http://localhost:8080/payment';

// Verify OTP with external service
export async function verifyOTP(otpCode: string): Promise<{ success: boolean; message: string }> {
  try {
    const url = USE_VIRTUAL ? `${OTP_SERVICE_URL}/verify` : 'http://internal-otp-service/verify';
    
    const response = await axios.post(url, { otp: otpCode }, {
      timeout: 5000 // 5 second timeout
    });
    
    return response.data;
  } catch (error) {
    console.error('OTP verification error:', error);
    throw new Error('Failed to verify OTP');
  }
}

// Process payment with external service
export async function processPayment(amount: number, accountId: number): Promise<{ success: boolean; transactionId?: string; message: string }> {
  try {
    const url = USE_VIRTUAL ? `${PAYMENT_GATEWAY_URL}/process` : 'http://internal-payment-service/process';
    
    const response = await axios.post(url, { 
      amount, 
      accountId,
      currency: 'USD'
    }, {
      timeout: 10000 // 10 second timeout
    });
    
    return response.data;
  } catch (error) {
    console.error('Payment processing error:', error);
    throw new Error('Failed to process payment');
  }
}