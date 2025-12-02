#!/bin/bash

# Script to set up and start the development environment

echo "Setting up development environment..."

# Copy .env.example to .env if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file from .env.example..."
  cp .env.example .env
fi

# Start infrastructure with Docker Compose
echo "Starting infrastructure services..."
cd infra
docker-compose up -d

echo "Waiting for services to start..."
sleep 30

# Run database migrations
echo "Running database migrations..."
cd ..
./scripts/migrate_db.sh

# Seed the database
echo "Seeding the database..."
./scripts/seed_db.sh

echo "Development environment is ready!"
echo ""
echo "Services are running:"
echo "- Auth Service: http://localhost:3001"
echo "- Accounts Service: http://localhost:3002"
echo "- Transfer Service: http://localhost:3003"
echo "- Ledger Service: http://localhost:3004"
echo "- Admin UI: http://localhost:8081"
echo ""
echo "You can now start developing!"