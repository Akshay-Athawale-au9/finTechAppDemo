"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transfersRouter = void 0;
const express_1 = require("express");
const database_1 = require("../config/database");
const redis_1 = require("../config/redis");
const kafka_1 = require("../config/kafka");
const external_services_1 = require("../utils/external-services");
const fraud_detection_1 = require("../utils/fraud-detection");
const router = (0, express_1.Router)();
exports.transfersRouter = router;
router.post('/', async (req, res) => {
    const client = await database_1.pool.connect();
    try {
        const { fromAccountId, toAccountId, amount } = req.body;
        const idempotencyKey = req.header('Idempotency-Key');
        if (!fromAccountId || !toAccountId || !amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid fromAccountId, toAccountId, and amount are required' });
        }
        if (!idempotencyKey) {
            return res.status(400).json({ error: 'Idempotency-Key header is required' });
        }
        const fraudRisk = (0, fraud_detection_1.detectFraud)({
            amount,
            accountId: fromAccountId,
            recipientId: toAccountId,
            transactionType: 'transfer'
        });
        if (fraudRisk.recommendation === 'reject') {
            await database_1.pool.query(`INSERT INTO audit_logs (service_name, action, resource_type, metadata) 
         VALUES ($1, $2, $3, $4)`, [
                'transfer-service',
                'fraud_detected',
                'transfer',
                JSON.stringify({ fromAccountId, toAccountId, amount, fraudRisk })
            ]);
            return res.status(400).json({
                error: 'Transaction blocked due to fraud detection',
                fraudFlags: fraudRisk.flags
            });
        }
        if (fraudRisk.recommendation === 'review') {
            await database_1.pool.query(`INSERT INTO audit_logs (service_name, action, resource_type, metadata) 
         VALUES ($1, $2, $3, $4)`, [
                'transfer-service',
                'fraud_review_required',
                'transfer',
                JSON.stringify({ fromAccountId, toAccountId, amount, fraudRisk })
            ]);
        }
        const rateLimitKey = `transfer:${fromAccountId}`;
        const rateLimit = await redis_1.redisClient.get(rateLimitKey);
        if (rateLimit) {
            return res.status(429).json({ error: 'Rate limit exceeded' });
        }
        await redis_1.redisClient.setex(rateLimitKey, 900, '1');
        const existingTransfer = await client.query('SELECT id, status FROM transfers WHERE reference_id = $1', [idempotencyKey]);
        if (existingTransfer.rows.length > 0) {
            return res.status(200).json({
                message: 'Transfer already processed',
                transferId: existingTransfer.rows[0].id,
                status: existingTransfer.rows[0].status
            });
        }
        await client.query('BEGIN');
        const fromAccount = await client.query('SELECT balance FROM accounts WHERE id = $1 FOR UPDATE', [fromAccountId]);
        if (fromAccount.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'From account not found' });
        }
        const toAccount = await client.query('SELECT id FROM accounts WHERE id = $1 FOR UPDATE', [toAccountId]);
        if (toAccount.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'To account not found' });
        }
        const currentBalance = parseFloat(fromAccount.rows[0].balance);
        if (currentBalance < amount) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Insufficient funds' });
        }
        const transferResult = await client.query(`INSERT INTO transfers (from_account_id, to_account_id, amount, reference_id, status) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id`, [fromAccountId, toAccountId, amount, idempotencyKey, 'pending']);
        const transferId = transferResult.rows[0].id;
        const otpVerification = await (0, external_services_1.verifyOTP)('123456');
        if (!otpVerification.success) {
            await client.query('UPDATE transfers SET status = $1 WHERE id = $2', ['failed', transferId]);
            await client.query('COMMIT');
            return res.status(400).json({ error: 'OTP verification failed' });
        }
        await client.query('UPDATE transfers SET otp_verified = true WHERE id = $1', [transferId]);
        const paymentResult = await (0, external_services_1.processPayment)(amount, fromAccountId);
        if (!paymentResult.success) {
            await client.query('UPDATE transfers SET status = $1 WHERE id = $2', ['failed', transferId]);
            await client.query('COMMIT');
            return res.status(400).json({ error: 'Payment processing failed' });
        }
        await client.query('UPDATE transfers SET payment_processed = true WHERE id = $1', [transferId]);
        const newFromBalance = currentBalance - amount;
        const newToBalance = parseFloat((await client.query('SELECT balance FROM accounts WHERE id = $1', [toAccountId])).rows[0].balance) + amount;
        await client.query('UPDATE accounts SET balance = $1 WHERE id = $2', [newFromBalance, fromAccountId]);
        await client.query('UPDATE accounts SET balance = $1 WHERE id = $2', [newToBalance, toAccountId]);
        const fromTransaction = await client.query(`INSERT INTO transactions (account_id, transaction_type, amount, description, reference_id, status) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id`, [fromAccountId, 'transfer', amount, `Transfer to account ${toAccountId}`, idempotencyKey, 'completed']);
        const toTransaction = await client.query(`INSERT INTO transactions (account_id, transaction_type, amount, description, reference_id, status) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id`, [toAccountId, 'transfer', amount, `Transfer from account ${fromAccountId}`, idempotencyKey, 'completed']);
        await client.query(`INSERT INTO ledger (transaction_id, account_id, entry_type, amount, balance_after, description) 
       VALUES ($1, $2, $3, $4, $5, $6)`, [fromTransaction.rows[0].id, fromAccountId, 'debit', amount, newFromBalance, `Transfer to account ${toAccountId}`]);
        await client.query(`INSERT INTO ledger (transaction_id, account_id, entry_type, amount, balance_after, description) 
       VALUES ($1, $2, $3, $4, $5, $6)`, [toTransaction.rows[0].id, toAccountId, 'credit', amount, newToBalance, `Transfer from account ${fromAccountId}`]);
        await client.query('UPDATE transfers SET status = $1 WHERE id = $2', ['completed', transferId]);
        await client.query('COMMIT');
        await kafka_1.producer.connect();
        await kafka_1.producer.send({
            topic: 'ledger-events',
            messages: [
                {
                    value: JSON.stringify({
                        eventType: 'LEDGER_UPDATED',
                        accountId: fromAccountId,
                        transactionId: fromTransaction.rows[0].id,
                        amount: -amount,
                        balanceAfter: newFromBalance,
                        timestamp: new Date().toISOString()
                    })
                },
                {
                    value: JSON.stringify({
                        eventType: 'LEDGER_UPDATED',
                        accountId: toAccountId,
                        transactionId: toTransaction.rows[0].id,
                        amount: amount,
                        balanceAfter: newToBalance,
                        timestamp: new Date().toISOString()
                    })
                }
            ]
        });
        res.status(201).json({
            message: 'Transfer completed successfully',
            transferId,
            fromTransactionId: fromTransaction.rows[0].id,
            toTransactionId: toTransaction.rows[0].id,
            fraudRisk
        });
    }
    catch (error) {
        console.error('Transfer error:', error);
        await client.query('ROLLBACK');
        res.status(500).json({ error: 'Internal server error' });
    }
    finally {
        client.release();
    }
});
router.get('/:id/status', async (req, res) => {
    try {
        const transferId = parseInt(req.params.id, 10);
        if (isNaN(transferId)) {
            return res.status(400).json({ error: 'Invalid transfer ID' });
        }
        const result = await database_1.pool.query('SELECT status, created_at, updated_at FROM transfers WHERE id = $1', [transferId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transfer not found' });
        }
        res.json({ status: result.rows[0].status, createdAt: result.rows[0].created_at, updatedAt: result.rows[0].updated_at });
    }
    catch (error) {
        console.error('Error fetching transfer status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=transfers.js.map