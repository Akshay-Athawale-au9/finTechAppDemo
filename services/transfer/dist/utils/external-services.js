"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTP = verifyOTP;
exports.processPayment = processPayment;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const USE_VIRTUAL = process.env.USE_VIRTUAL === 'true';
const OTP_SERVICE_URL = process.env.OTP_SERVICE_URL || 'http://localhost:8080/otp';
const PAYMENT_GATEWAY_URL = process.env.PAYMENT_GATEWAY_URL || 'http://localhost:8080/payment';
async function verifyOTP(otpCode) {
    try {
        const url = USE_VIRTUAL ? `${OTP_SERVICE_URL}/verify` : 'http://internal-otp-service/verify';
        const response = await axios_1.default.post(url, { otp: otpCode }, {
            timeout: 5000
        });
        return response.data;
    }
    catch (error) {
        console.error('OTP verification error:', error);
        throw new Error('Failed to verify OTP');
    }
}
async function processPayment(amount, accountId) {
    try {
        const url = USE_VIRTUAL ? `${PAYMENT_GATEWAY_URL}/process` : 'http://internal-payment-service/process';
        const response = await axios_1.default.post(url, {
            amount,
            accountId,
            currency: 'USD'
        }, {
            timeout: 10000
        });
        return response.data;
    }
    catch (error) {
        console.error('Payment processing error:', error);
        throw new Error('Failed to process payment');
    }
}
//# sourceMappingURL=external-services.js.map