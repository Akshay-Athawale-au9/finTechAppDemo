export declare function verifyOTP(otpCode: string): Promise<{
    success: boolean;
    message: string;
}>;
export declare function processPayment(amount: number, accountId: number): Promise<{
    success: boolean;
    transactionId?: string;
    message: string;
}>;
//# sourceMappingURL=external-services.d.ts.map