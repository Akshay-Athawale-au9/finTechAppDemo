import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import crypto from 'crypto';

const router = Router();

// Webhook endpoint for external payment notifications
router.post('/payment', async (req: Request, res: Response) => {
  try {
    // Get signature from header
    const signature = req.header('X-Signature');
    
    if (!signature) {
      return res.status(400).json({ error: 'Missing signature header' });
    }
    
    // In a real implementation, we would verify the signature
    // For now, we'll just log the webhook data
    console.log('Webhook received:', {
      headers: req.headers,
      body: req.body,
      signature
    });
    
    // Store webhook data in audit logs
    await pool.query(
      `INSERT INTO audit_logs (service_name, action, resource_type, metadata) 
       VALUES ($1, $2, $3, $4)`,
      [
        'webhook-service',
        'payment_notification',
        'webhook',
        JSON.stringify(req.body)
      ]
    );
    
    return res.status(200).json({ message: 'Webhook received successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as webhookRouter };