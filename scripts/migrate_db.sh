#!/bin/bash

# Database migration script
set -e

echo "Running database migrations..."

# Get database connection details from environment variables
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-fintech}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}

# Export password for psql
export PGPASSWORD=$DB_PASSWORD

# Run migrations in order
for migration in ./migrations/*.sql; do
    echo "Running migration: $migration"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $migration
done

echo "Database migrations completed successfully!"