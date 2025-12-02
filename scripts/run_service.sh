#!/bin/bash

# Script to run a specific service locally
# Usage: ./scripts/run_service.sh <service-name>

SERVICE_NAME=$1

if [ -z "$SERVICE_NAME" ]; then
  echo "Usage: $0 <service-name>"
  echo "Available services: auth, accounts, transfer, ledger, consumer"
  exit 1
fi

case $SERVICE_NAME in
  auth)
    cd services/auth
    echo "Starting Auth service..."
    npm run dev
    ;;
  accounts)
    cd services/accounts
    echo "Starting Accounts service..."
    npm run dev
    ;;
  transfer)
    cd services/transfer
    echo "Starting Transfer service..."
    npm run dev
    ;;
  ledger)
    cd services/ledger
    echo "Starting Ledger service..."
    npm run dev
    ;;
  consumer)
    cd services/consumer
    echo "Starting Consumer service..."
    npm run dev
    ;;
  *)
    echo "Unknown service: $SERVICE_NAME"
    echo "Available services: auth, accounts, transfer, ledger, consumer"
    exit 1
    ;;
esac