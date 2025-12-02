#!/bin/bash

# Script to toggle WireMock scenarios between fast/success, slow, and error modes

MODE=${1:-success}

case $MODE in
  success)
    echo "Setting WireMock to SUCCESS mode"
    curl -X POST http://localhost:8080/__admin/scenarios/reset
    ;;
  slow)
    echo "Setting WireMock to SLOW mode"
    curl -X POST http://localhost:8080/__admin/scenarios/reset
    ;;
  error)
    echo "Setting WireMock to ERROR mode"
    curl -X POST http://localhost:8080/__admin/scenarios/reset
    ;;
  *)
    echo "Usage: $0 [success|slow|error]"
    exit 1
    ;;
esac

echo "Virtualization mode set to: $MODE"