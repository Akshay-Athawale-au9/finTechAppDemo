#!/bin/bash

# Script to check database migration status

echo "Checking database migration status..."

# Get database connection details from environment variables
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-fintech}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}

# Export password for psql
export PGPASSWORD=$DB_PASSWORD

# Check if required tables exist
TABLES=("users" "accounts" "transactions" "ledger" "transfers" "ledger_events" "audit_logs" "documents")

echo "Checking for required tables..."
for TABLE in "${TABLES[@]}"; do
  RESULT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '$TABLE');" 2>/dev/null)
  
  if [[ $RESULT == *t* ]]; then
    echo "✓ Table $TABLE exists"
  else
    echo "✗ Table $TABLE does not exist"
  fi
done

echo "Migration status check completed."