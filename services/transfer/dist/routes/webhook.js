"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookRouter = void 0;
const express_1 = require("express");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
exports.webhookRouter = router;
router.post('/payment', async (req, res) => {
    try {
        const signature = req.header('X-Signature');
        if (!signature) {
            return res.status(400).json({ error: 'Missing signature header' });
        }
        console.log('Webhook received:', {
            headers: req.headers,
            body: req.body,
            signature
        });
        await database_1.pool.query(`INSERT INTO audit_logs (service_name, action, resource_type, metadata) 
       VALUES ($1, $2, $3, $4)`, [
            'webhook-service',
            'payment_notification',
            'webhook',
            JSON.stringify(req.body)
        ]);
        res.status(200).json({ message: 'Webhook received successfully' });
    }
    catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=webhook.js.map