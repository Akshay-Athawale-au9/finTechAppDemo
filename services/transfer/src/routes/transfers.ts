import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { redisClient } from '../config/redis';
import { producer } from '../config/kafka';
import { verifyOTP, processPayment } from '../utils/external-services';
import { detectFraud } from '../utils/fraud-detection';

const router = Router();

// Initiate fund transfer
router.post('/', async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { fromAccountId, toAccountId, amount } = req.body;
    const idempotencyKey = req.header('Idempotency-Key');
    
    // Validate input
    if (!fromAccountId || !toAccountId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid fromAccountId, toAccountId, and amount are required' });
    }
    
    if (!idempotencyKey) {
      return res.status(400).json({ error: 'Idempotency-Key header is required' });
    }
    
    // Fraud detection
    const fraudRisk = detectFraud({
      amount,
      accountId: fromAccountId,
      recipientId: toAccountId,
      transactionType: 'transfer'
    });
    
    // Reject high-risk transactions
    if (fraudRisk.recommendation === 'reject') {
      // Log the fraud detection
      await pool.query(
        `INSERT INTO audit_logs (service_name, action, resource_type, metadata) 
         VALUES ($1, $2, $3, $4)`,
        [
          'transfer-service',
          'fraud_detected',
          'transfer',
          JSON.stringify({ fromAccountId, toAccountId, amount, fraudRisk })
        ]
      );
      
      return res.status(400).json({ 
        error: 'Transaction blocked due to fraud detection',
        fraudFlags: fraudRisk.flags
      });
    }
    
    // Review medium-risk transactions
    if (fraudRisk.recommendation === 'review') {
      // In a real implementation, we might pause the transaction for manual review
      // For now, we'll just log it and continue
      await pool.query(
        `INSERT INTO audit_logs (service_name, action, resource_type, metadata) 
         VALUES ($1, $2, $3, $4)`,
        [
          'transfer-service',
          'fraud_review_required',
          'transfer',
          JSON.stringify({ fromAccountId, toAccountId, amount, fraudRisk })
        ]
      );
    }
    
    // Check rate limiting
    const rateLimitKey = `transfer:${fromAccountId}`;
    const rateLimit = await redisClient.get(rateLimitKey);
    if (rateLimit) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    
    // Set rate limit (100 requests per 15 minutes)
    await redisClient.setEx(rateLimitKey, 900, '1');
    
    // Check if transfer with this idempotency key already exists
    const existingTransfer = await client.query(
      'SELECT id, status FROM transfers WHERE reference_id = $1',
      [idempotencyKey]
    );
    
    if (existingTransfer.rows.length > 0) {
      return res.status(200).json({
        message: 'Transfer already processed',
        transferId: existingTransfer.rows[0].id,
        status: existingTransfer.rows[0].status
      });
    }
    
    // Start database transaction
    await client.query('BEGIN');
    
    // Lock accounts to prevent concurrent transfers
    const fromAccount = await client.query(
      'SELECT balance FROM accounts WHERE id = $1 FOR UPDATE',
      [fromAccountId]
    );
    
    if (fromAccount.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'From account not found' });
    }
    
    const toAccount = await client.query(
      'SELECT id FROM accounts WHERE id = $1 FOR UPDATE',
      [toAccountId]
    );
    
    if (toAccount.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'To account not found' });
    }
    
    const currentBalance = parseFloat(fromAccount.rows[0].balance);
    if (currentBalance < amount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient funds' });
    }
    
    // Create pending transfer record
    const transferResult = await client.query(
      `INSERT INTO transfers (from_account_id, to_account_id, amount, reference_id, status) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id`,
      [fromAccountId, toAccountId, amount, idempotencyKey, 'pending']
    );
    
    const transferId = transferResult.rows[0].id;
    
    // Verify OTP (in a real scenario, this would be provided by the client)
    const otpVerification = await verifyOTP('123456'); // Dummy OTP for demo
    if (!otpVerification.success) {
      await client.query(
        'UPDATE transfers SET status = $1 WHERE id = $2',
        ['failed', transferId]
      );
      await client.query('COMMIT');
      return res.status(400).json({ error: 'OTP verification failed' });
    }
    
    // Mark OTP as verified
    await client.query(
      'UPDATE transfers SET otp_verified = true WHERE id = $1',
      [transferId]
    );
    
    // Process payment
    const paymentResult = await processPayment(amount, fromAccountId);
    if (!paymentResult.success) {
      await client.query(
        'UPDATE transfers SET status = $1 WHERE id = $2',
        ['failed', transferId]
      );
      await client.query('COMMIT');
      return res.status(400).json({ error: 'Payment processing failed' });
    }
    
    // Mark payment as processed
    await client.query(
      'UPDATE transfers SET payment_processed = true WHERE id = $1',
      [transferId]
    );
    
    // Update account balances
    const newFromBalance = currentBalance - amount;
    const newToBalance = parseFloat((await client.query(
      'SELECT balance FROM accounts WHERE id = $1',
      [toAccountId]
    )).rows[0].balance) + amount;
    
    await client.query(
      'UPDATE accounts SET balance = $1 WHERE id = $2',
      [newFromBalance, fromAccountId]
    );
    
    await client.query(
      'UPDATE accounts SET balance = $1 WHERE id = $2',
      [newToBalance, toAccountId]
    );
    
    // Create transaction records
    const fromTransaction = await client.query(
      `INSERT INTO transactions (account_id, transaction_type, amount, description, reference_id, status) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id`,
      [fromAccountId, 'transfer', amount, `Transfer to account ${toAccountId}`, idempotencyKey, 'completed']
    );
    
    const toTransaction = await client.query(
      `INSERT INTO transactions (account_id, transaction_type, amount, description, reference_id, status) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id`,
      [toAccountId, 'transfer', amount, `Transfer from account ${fromAccountId}`, idempotencyKey, 'completed']
    );
    
    // Create ledger entries
    await client.query(
      `INSERT INTO ledger (transaction_id, account_id, entry_type, amount, balance_after, description) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [fromTransaction.rows[0].id, fromAccountId, 'debit', amount, newFromBalance, `Transfer to account ${toAccountId}`]
    );
    
    await client.query(
      `INSERT INTO ledger (transaction_id, account_id, entry_type, amount, balance_after, description) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [toTransaction.rows[0].id, toAccountId, 'credit', amount, newToBalance, `Transfer from account ${fromAccountId}`]
    );
    
    // Update transfer status to completed
    await client.query(
      'UPDATE transfers SET status = $1 WHERE id = $2',
      ['completed', transferId]
    );
    
    await client.query('COMMIT');
    
    // Publish LEDGER_UPDATED event to Kafka
    await producer.connect();
    await producer.send({
      topic: 'ledger-events',
      messages: [
        {
          value: JSON.stringify({
            eventType: 'LEDGER_UPDATED',
            accountId: fromAccountId,
            transactionId: fromTransaction.rows[0].id,
            amount: -amount, // Negative for debit
            balanceAfter: newFromBalance,
            timestamp: new Date().toISOString()
          })
        },
        {
          value: JSON.stringify({
            eventType: 'LEDGER_UPDATED',
            accountId: toAccountId,
            transactionId: toTransaction.rows[0].id,
            amount: amount, // Positive for credit
            balanceAfter: newToBalance,
            timestamp: new Date().toISOString()
          })
        }
      ]
    });
    
    return res.status(201).json({
      message: 'Transfer completed successfully',
      transferId,
      fromTransactionId: fromTransaction.rows[0].id,
      toTransactionId: toTransaction.rows[0].id,
      fraudRisk // Include fraud risk in response for transparency
    });
  } catch (error) {
    console.error('Transfer error:', error);
    await client.query('ROLLBACK');
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Get transfer status
router.get('/:id/status', async (req: Request, res: Response) => {
  try {
    const transferId = parseInt(req.params.id, 10);
    
    if (isNaN(transferId)) {
      return res.status(400).json({ error: 'Invalid transfer ID' });
    }
    
    const result = await pool.query(
      'SELECT status, created_at, updated_at FROM transfers WHERE id = $1',
      [transferId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transfer not found' });
    }
    
    return res.json({ status: result.rows[0].status, createdAt: result.rows[0].created_at, updatedAt: result.rows[0].updated_at });
  } catch (error) {
    console.error('Error fetching transfer status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as transfersRouter };