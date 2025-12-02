#!/bin/bash

# Script to read messages from Kafka/Redpanda ledger-events topic

COUNT=${1:-10}

echo "Reading last $COUNT messages from ledger-events topic..."

# Using rpk (Redpanda CLI) to consume messages
docker exec -it fintech-redpanda rpk topic consume ledger-events --num $COUNT

echo "Finished reading messages."