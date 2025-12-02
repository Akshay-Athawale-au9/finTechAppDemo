"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ledgerRouter = void 0;
const express_1 = require("express");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
exports.ledgerRouter = router;
router.get('/accounts/:accountId', async (req, res) => {
    try {
        const accountId = parseInt(req.params.accountId, 10);
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;
        if (isNaN(accountId)) {
            return res.status(400).json({ error: 'Invalid account ID' });
        }
        const offset = (page - 1) * size;
        const result = await database_1.pool.query(`SELECT l.*, t.transaction_type, t.description as transaction_description
       FROM ledger l
       JOIN transactions t ON l.transaction_id = t.id
       WHERE l.account_id = $1
       ORDER BY l.created_at DESC
       LIMIT $2 OFFSET $3`, [accountId, size, offset]);
        const countResult = await database_1.pool.query('SELECT COUNT(*) FROM ledger WHERE account_id = $1', [accountId]);
        const totalCount = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalCount / size);
        res.json({
            entries: result.rows,
            pagination: {
                page,
                size,
                totalCount,
                totalPages
            }
        });
    }
    catch (error) {
        console.error('Error fetching ledger entries:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/accounts/:accountId/transactions', async (req, res) => {
    try {
        const accountId = parseInt(req.params.accountId, 10);
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;
        if (isNaN(accountId)) {
            return res.status(400).json({ error: 'Invalid account ID' });
        }
        const offset = (page - 1) * size;
        const result = await database_1.pool.query(`SELECT * FROM transactions 
       WHERE account_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`, [accountId, size, offset]);
        const countResult = await database_1.pool.query('SELECT COUNT(*) FROM transactions WHERE account_id = $1', [accountId]);
        const totalCount = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalCount / size);
        res.json({
            transactions: result.rows,
            pagination: {
                page,
                size,
                totalCount,
                totalPages
            }
        });
    }
    catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=ledger.js.map