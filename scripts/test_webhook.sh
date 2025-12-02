#!/bin/bash

# Script to test webhook functionality

echo "Testing webhook endpoint..."

# Send a test webhook
curl -X POST http://localhost:3003/webhook/payment \
  -H "Content-Type: application/json" \
  -H "X-Signature: test-signature-123" \
  -d '{
    "eventType": "payment.completed",
    "data": {
      "transactionId": "txn_123456",
      "amount": 100.50,
      "currency": "USD",
      "timestamp": "2023-05-15T10:30:00Z"
    }
  }'

echo ""
echo "Webhook test completed."