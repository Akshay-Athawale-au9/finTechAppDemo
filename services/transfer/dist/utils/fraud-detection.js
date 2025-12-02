"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectFraud = detectFraud;
function detectFraud(transaction) {
    const risk = {
        score: 0,
        flags: [],
        recommendation: 'approve'
    };
    if (transaction.amount > 10000) {
        risk.score += 30;
        risk.flags.push('HIGH_AMOUNT');
    }
    else if (transaction.amount > 5000) {
        risk.score += 15;
        risk.flags.push('MEDIUM_HIGH_AMOUNT');
    }
    if (transaction.amount % 1000 === 0 && transaction.amount > 1000) {
        risk.score += 10;
        risk.flags.push('ROUND_NUMBER');
    }
    const hour = new Date().getHours();
    if (hour >= 2 && hour <= 5) {
        risk.score += 5;
        risk.flags.push('OFF_HOURS');
    }
    if (risk.score >= 50) {
        risk.recommendation = 'reject';
    }
    else if (risk.score >= 20) {
        risk.recommendation = 'review';
    }
    return risk;
}
//# sourceMappingURL=fraud-detection.js.map