"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.externalRouter = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
exports.externalRouter = router;
router.post('/otp/verify', (req, res) => {
    try {
        const { otp } = req.body;
        if (otp && otp.length >= 4) {
            res.json({
                success: true,
                message: 'OTP verified successfully'
            });
        }
        else {
            res.status(400).json({
                success: false,
                message: 'Invalid OTP format'
            });
        }
    }
    catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/payment/process', (req, res) => {
    try {
        const { amount, accountId } = req.body;
        if (amount && accountId) {
            res.json({
                success: true,
                transactionId: 'txn_' + Date.now(),
                message: 'Payment processed successfully'
            });
        }
        else {
            res.status(400).json({
                success: false,
                message: 'Amount and account ID are required'
            });
        }
    }
    catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=external.js.map