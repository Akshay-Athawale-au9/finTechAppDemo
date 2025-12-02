#!/bin/bash

# Script to install dependencies for all services

echo "Installing dependencies for all services..."

# Install dependencies for each service
SERVICES=("auth" "accounts" "transfer" "ledger" "consumer")

for SERVICE in "${SERVICES[@]}"; do
  echo "Installing dependencies for $SERVICE service..."
  cd services/$SERVICE
  npm install
  cd ../..
done

echo "All dependencies installed successfully!"