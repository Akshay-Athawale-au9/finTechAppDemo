// Simple fraud detection utility

interface TransactionData {
  amount: number;
  accountId: number;
  recipientId?: number;
  transactionType: string;
}

interface FraudRisk {
  score: number; // 0-100, higher means more risky
  flags: string[];
  recommendation: 'approve' | 'review' | 'reject';
}

/**
 * Simple fraud detection function
 * @param transaction Transaction data to evaluate
 * @returns Fraud risk assessment
 */
export function detectFraud(transaction: TransactionData): FraudRisk {
  const risk: FraudRisk = {
    score: 0,
    flags: [],
    recommendation: 'approve'
  };
  
  // Check for large transactions
  if (transaction.amount > 10000) {
    risk.score += 30;
    risk.flags.push('HIGH_AMOUNT');
  } else if (transaction.amount > 5000) {
    risk.score += 15;
    risk.flags.push('MEDIUM_HIGH_AMOUNT');
  }
  
  // Check for round numbers (often suspicious)
  if (transaction.amount % 1000 === 0 && transaction.amount > 1000) {
    risk.score += 10;
    risk.flags.push('ROUND_NUMBER');
  }
  
  // Check for frequent transactions (would need history data in real implementation)
  // This is a simplified check
  const hour = new Date().getHours();
  if (hour >= 2 && hour <= 5) {
    risk.score += 5;
    risk.flags.push('OFF_HOURS');
  }
  
  // Determine recommendation based on score
  if (risk.score >= 50) {
    risk.recommendation = 'reject';
  } else if (risk.score >= 20) {
    risk.recommendation = 'review';
  }
  
  return risk;
}