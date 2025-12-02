"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
exports.adminRouter = router;
router.get('/migrations', async (req, res) => {
    try {
        const requiredTables = [
            'users',
            'accounts',
            'transactions',
            'ledger',
            'transfers',
            'ledger_events',
            'audit_logs',
            'documents'
        ];
        const results = [];
        for (const table of requiredTables) {
            const result = await database_1.pool.query('SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)', [table]);
            results.push({
                table,
                exists: result.rows[0].exists
            });
        }
        res.json({
            status: 'Migration status check completed',
            tables: results
        });
    }
    catch (error) {
        console.error('Migration status check error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/audit-logs', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        if (limit < 1 || limit > 100) {
            return res.status(400).json({ error: 'Invalid limit parameter (1-100)' });
        }
        const result = await database_1.pool.query(`SELECT id, service_name, action, resource_type, resource_id, user_id, ip_address, user_agent, metadata, created_at
       FROM audit_logs
       ORDER BY created_at DESC
       LIMIT $1`, [limit]);
        res.json({
            logs: result.rows
        });
    }
    catch (error) {
        console.error('Audit logs fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=admin.js.map