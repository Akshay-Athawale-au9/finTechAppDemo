#!/bin/bash

# Script to build all services

echo "Building all services..."

# Build each service
SERVICES=("auth" "accounts" "transfer" "ledger" "consumer")

for SERVICE in "${SERVICES[@]}"; do
  echo "Building $SERVICE service..."
  cd services/$SERVICE
  npm run build
  cd ../..
done

echo "All services built successfully!"