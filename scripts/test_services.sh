#!/bin/bash

# Script to test that all services are working

echo "Testing services..."

# Test Auth Service
echo "Testing Auth Service..."
curl -s -o /dev/null -w "Auth Service: %{http_code}\n" http://localhost:3001/health

# Test Accounts Service
echo "Testing Accounts Service..."
curl -s -o /dev/null -w "Accounts Service: %{http_code}\n" http://localhost:3002/health

# Test Transfer Service
echo "Testing Transfer Service..."
curl -s -o /dev/null -w "Transfer Service: %{http_code}\n" http://localhost:3003/health

# Test Ledger Service
echo "Testing Ledger Service..."
curl -s -o /dev/null -w "Ledger Service: %{http_code}\n" http://localhost:3004/health

# Test PostgreSQL
echo "Testing PostgreSQL..."
docker exec fintech-postgres pg_isready -U postgres > /dev/null 2>&1 && echo "PostgreSQL: OK" || echo "PostgreSQL: ERROR"

# Test Redis
echo "Testing Redis..."
docker exec fintech-redis redis-cli ping > /dev/null 2>&1 && echo "Redis: OK" || echo "Redis: ERROR"

# Test Redpanda
echo "Testing Redpanda..."
docker exec fintech-redpanda rpk cluster health > /dev/null 2>&1 && echo "Redpanda: OK" || echo "Redpanda: ERROR"

# Test WireMock
echo "Testing WireMock..."
curl -s -o /dev/null -w "WireMock: %{http_code}\n" http://localhost:8080/__admin

echo "Service tests completed!"