#!/bin/bash

# Database seeding script
set -e

echo "Seeding database..."

# Get database connection details from environment variables
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-fintech}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}

# Check if psql is available
if ! command -v psql &> /dev/null
then
    echo "Error: psql command not found. Please install PostgreSQL client tools."
    echo "On Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "On CentOS/RHEL: sudo yum install postgresql"
    echo "On macOS: brew install postgresql"
    echo "On Windows: Install PostgreSQL from https://www.postgresql.org/download/"
    exit 1
fi

# Export password for psql
export PGPASSWORD=$DB_PASSWORD

# Test database connection
echo "Testing database connection..."
if ! psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" &> /dev/null
then
    echo "Error: Could not connect to database. Please check your database settings and ensure the database is running."
    echo "Host: $DB_HOST"
    echo "Port: $DB_PORT"
    echo "Database: $DB_NAME"
    echo "User: $DB_USER"
    exit 1
fi

# Run seed data
echo "Running seed data..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ./seed/seed_data.sql

echo "Database seeding completed successfully!"