#!/bin/bash

echo "Running all fintech microservices tests..."
echo

cd "$(dirname "$0")"

echo "Before running tests, make sure you have installed all dependencies:"
echo "  pip install -r python/requirements.txt"
echo "  pip install -r ui/requirements.txt"
echo "  pip install -r e2e/requirements.txt"
echo "  pip install -r performance/requirements.txt"
echo "  pip install -r security/requirements.txt"
echo "  playwright install"
echo

echo "Also ensure all services are running:"
echo "  cd \$(dirname "\$0")/../.."
echo "  docker-compose up -d"
echo

echo "Running comprehensive test suite..."
python run_comprehensive_tests.py

echo
echo "Test execution completed."