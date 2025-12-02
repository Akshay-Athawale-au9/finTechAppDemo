#!/bin/bash

# Script to stop the development environment

echo "Stopping development environment..."

# Stop infrastructure with Docker Compose
echo "Stopping infrastructure services..."
cd infra
docker-compose down

echo "Development environment stopped!"