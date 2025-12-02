"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionsRouter = void 0;
const express_1 = require("express");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
exports.transactionsRouter = router;
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;
        if (page < 1 || size < 1 || size > 100) {
            return res.status(400).json({ error: 'Invalid page or size parameters' });
        }
        const offset = (page - 1) * size;
        const result = await database_1.pool.query(`SELECT id, account_id, transaction_type, amount, currency, description, reference_id, status, created_at
       FROM transactions
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`, [size, offset]);
        const countResult = await database_1.pool.query('SELECT COUNT(*) FROM transactions');
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
//# sourceMappingURL=transactions.js.map