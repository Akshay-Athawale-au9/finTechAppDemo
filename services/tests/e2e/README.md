# End-to-End (E2E) Tests

This directory contains end-to-end tests that validate complete user flows across multiple services.

## Directory Structure

```
e2e/
├── test_complete_user_flow.py  # Tests for complete user journeys
└── requirements.txt            # E2E testing dependencies
```

## Prerequisites

1. Python 3.10+
2. All services must be running (via `docker-compose up`)
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running E2E Tests

```bash
cd d:\Interview\fintechApplciaitioon\services\tests\e2e
python -m pytest test_complete_user_flow.py -v
```

## Test Coverage

### Complete User Flow Tests
1. `test_complete_user_registration_to_transfer_flow` - Tests the complete flow from user registration to fund transfer
2. `test_user_account_balance_updates_after_transfer` - Tests that account balances update correctly after a transfer

## Test Process

E2E tests simulate real user interactions by:

1. Registering new users
2. Logging in to obtain authentication tokens
3. Retrieving account information
4. Initiating fund transfers between accounts
5. Verifying the results of these operations

## Service Dependencies

E2E tests require all of the following services to be running:
- Auth Service (Port 3001)
- Accounts Service (Port 3002)
- Transfer Service (Port 3003)
- Ledger Service (Port 3004)
- Consumer Service
- PostgreSQL Database
- Redis
- Redpanda (Kafka)

## Test Data

E2E tests create temporary test users and accounts. No permanent data is modified in the system.

## Execution Time

E2E tests typically take longer to execute than unit tests because they:
- Interact with actual services
- Wait for database operations to complete
- Process real transactions through the system