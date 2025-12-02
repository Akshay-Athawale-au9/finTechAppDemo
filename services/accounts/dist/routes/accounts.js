"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountsRouter = void 0;
const express_1 = require("express");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
exports.accountsRouter = router;
router.get('/', async (req, res) => {
    try {
        const userId = req.userId;
        console.log(`Fetching accounts for user ID: ${userId}`);
        const result = await database_1.pool.query(`SELECT id, account_number, account_type, balance, currency, status, created_at 
       FROM accounts 
       WHERE user_id = $1`, [userId]);
        console.log(`Found ${result.rows.length} accounts for user ID ${userId}`);
        return res.json({ accounts: result.rows });
    }
    catch (error) {
        console.error('Error fetching accounts:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/:id/balance', async (req, res) => {
    try {
        const accountId = parseInt(req.params.id, 10);
        if (isNaN(accountId)) {
            return res.status(400).json({ error: 'Invalid account ID' });
        }
        const result = await database_1.pool.query('SELECT balance, currency FROM accounts WHERE id = $1', [accountId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }
        return res.json({ balance: result.rows[0].balance, currency: result.rows[0].currency });
    }
    catch (error) {
        console.error('Error fetching balance:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/:id/deposit', async (req, res) => {
    try {
        const accountId = parseInt(req.params.id, 10);
        const { amount, description } = req.body;
        if (isNaN(accountId)) {
            return res.status(400).json({ error: 'Invalid account ID' });
        }
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid amount is required' });
        }
        const client = await database_1.pool.connect();
        try {
            await client.query('BEGIN');
            const accountResult = await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2 RETURNING balance', [amount, accountId]);
            if (accountResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Account not found' });
            }
            const transactionResult = await client.query(`INSERT INTO transactions (account_id, transaction_type, amount, description, status) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, created_at`, [accountId, 'deposit', amount, description || 'Deposit', 'completed']);
            await client.query(`INSERT INTO ledger (transaction_id, account_id, entry_type, amount, balance_after, description) 
         VALUES ($1, $2, $3, $4, $5, $6)`, [transactionResult.rows[0].id, accountId, 'credit', amount, accountResult.rows[0].balance, description || 'Deposit']);
            await client.query('COMMIT');
            return res.status(201).json({
                message: 'Deposit successful',
                transactionId: transactionResult.rows[0].id,
                newBalance: accountResult.rows[0].balance,
                createdAt: transactionResult.rows[0].created_at
            });
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error processing deposit:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/:id/withdraw', async (req, res) => {
    try {
        const accountId = parseInt(req.params.id, 10);
        const { amount, description } = req.body;
        if (isNaN(accountId)) {
            return res.status(400).json({ error: 'Invalid account ID' });
        }
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid amount is required' });
        }
        const client = await database_1.pool.connect();
        try {
            await client.query('BEGIN');
            const accountResult = await client.query('SELECT balance FROM accounts WHERE id = $1 FOR UPDATE', [accountId]);
            if (accountResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Account not found' });
            }
            const currentBalance = parseFloat(accountResult.rows[0].balance);
            if (currentBalance < amount) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: 'Insufficient funds' });
            }
            const newBalance = currentBalance - amount;
            await client.query('UPDATE accounts SET balance = $1 WHERE id = $2', [newBalance, accountId]);
            const transactionResult = await client.query(`INSERT INTO transactions (account_id, transaction_type, amount, description, status) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, created_at`, [accountId, 'withdrawal', amount, description || 'Withdrawal', 'completed']);
            await client.query(`INSERT INTO ledger (transaction_id, account_id, entry_type, amount, balance_after, description) 
         VALUES ($1, $2, $3, $4, $5, $6)`, [transactionResult.rows[0].id, accountId, 'debit', amount, newBalance, description || 'Withdrawal']);
            await client.query('COMMIT');
            return res.status(201).json({
                message: 'Withdrawal successful',
                transactionId: transactionResult.rows[0].id,
                newBalance: newBalance,
                createdAt: transactionResult.rows[0].created_at
            });
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error processing withdrawal:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=accounts.js.map