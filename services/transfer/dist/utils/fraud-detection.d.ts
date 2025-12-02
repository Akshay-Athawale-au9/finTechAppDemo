interface TransactionData {
    amount: number;
    accountId: number;
    recipientId?: number;
    transactionType: string;
}
interface FraudRisk {
    score: number;
    flags: string[];
    recommendation: 'approve' | 'review' | 'reject';
}
export declare function detectFraud(transaction: TransactionData): FraudRisk;
export {};
//# sourceMappingURL=fraud-detection.d.ts.map