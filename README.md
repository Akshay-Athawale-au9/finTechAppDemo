# Fintech Microservice Application

A complete, runnable fintech microservice architecture with authentication, account management, fund transfers, and event-driven processing.

## Services Included

- Auth Service: User registration, authentication, JWT tokens
- Accounts Service: Account management and balance operations
- Transfer Service: Fund transfers with idempotency and external integrations
- Ledger Service: Double-entry bookkeeping and transaction recording
- Consumer Service: Event consumption for analytics and audit logging

## Infrastructure

- PostgreSQL: Primary database with migrations
- Redis: Caching and rate limiting
- Redpanda: Lightweight Kafka alternative
- WireMock: Service virtualization for external dependencies
- Admin UI: Simple interface for toggling mock scenarios

## Quick Start

1. Copy `.env.example` to `.env` and adjust values as needed
2. Run `docker-compose up` to start all services
3. Run database migrations and seed data (see below)
4. Access services via their respective ports

## Directory Structure

```
├── services/
│   ├── auth/
│   ├── accounts/
│   ├── transfer/
│   ├── ledger/
│   └── consumer/
├── infra/
│   ├── docker-compose.yml
│   └── wiremock/
├── migrations/
├── seed/
├── scripts/
├── admin-ui/
└── openapi/
```

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL client (psql) for running scripts (optional - Node.js scripts are provided as alternatives)

## Running the Application

### 1. Start all services

```bash
cd infra
docker-compose up
```

This will start all services including:
- PostgreSQL database
- Redis for caching/rate limiting
- Redpanda (Kafka) for event streaming
- WireMock for service virtualization
- All microservices (auth, accounts, transfer, ledger, consumer)
- Admin UI at http://localhost:8081

If you encounter architecture-related errors (like "Exec format error" for bcrypt), try:
```bash
docker-compose up --build
```

This will force rebuild all images for your current architecture.

### 2. Database Setup

Before using the application, you need to run database migrations and seed the database.

#### Run Migrations

There are multiple ways to run migrations depending on your environment:

##### Option 1: Shell script (Linux/macOS)
```bash
./scripts/migrate_db.sh
```

##### Option 2: Batch script (Windows)
```cmd
.\scripts\migrate_db.bat
```

##### Option 3: Node.js script (Cross-platform)
First install dependencies:
```bash
cd scripts
npm install
```

Then run the script:
```bash
npm run migrate
```

Or directly:
```bash
node migrate_db.js
```

#### Seed the database

There are multiple ways to seed the database depending on your environment:

##### Option 1: Shell script (Linux/macOS)
```bash
./scripts/seed_db.sh
```

##### Option 2: Batch script (Windows)
```cmd
.\scripts\seed_db.bat
```

##### Option 3: Node.js script (Cross-platform)
First ensure dependencies are installed (if not already done):
```bash
cd scripts
npm install
```

Then run the script:
```bash
npm run seed
```

Or directly:
```bash
node seed_db.js
```

This will populate the database with sample users and accounts:
- Admin user: admin@example.com / admin123
- Regular users: user1@example.com / admin123, user2@example.com / admin123
- Sample accounts with balances

### 3. Test the transfer flow

You can now test the complete transfer flow:
1. Authenticate as a user
2. Initiate a transfer between accounts
3. Observe the database entries and Kafka messages

### 4. Toggle mock scenarios

Use the admin UI or the toggle script to switch between:
- Fast/Success mode (default)
- Slow response mode
- Error response mode

```bash
./scripts/toggle_virtual.sh slow
./scripts/toggle_virtual.sh error
./scripts/toggle_virtual.sh success
```

### 5. View Kafka messages

To see the ledger events published by transfers:

```bash
./scripts/kafka_read.sh 10
```

## Service Endpoints

### Auth Service (Port 3001)
- POST `/auth/register` - Register new user
- POST `/auth/login` - User login
- POST `/auth/refresh` - Refresh access token
- GET `/health` - Health check

### Accounts Service (Port 3002)
- GET `/accounts` - List user accounts
- GET `/accounts/:id/balance` - Get account balance
- POST `/accounts/:id/deposit` - Deposit funds
- POST `/accounts/:id/withdraw` - Withdraw funds
- GET `/health` - Health check

### Transfer Service (Port 3003)
- POST `/transfer` - Initiate fund transfer
- GET `/transfer/:id/status` - Get transfer status
- GET `/transactions` - Get paginated transactions
- POST `/documents/upload` - Upload documents
- POST `/webhook/payment` - Payment webhook endpoint
- GET `/external/otp/verify` - Internal OTP verification
- POST `/external/payment/process` - Internal payment processing
- GET `/health` - Health check
- GET `/admin/migrations` - Check migration status
- GET `/admin/audit-logs` - View audit logs

### Ledger Service (Port 3004)
- GET `/ledger/accounts/:accountId` - Get ledger entries
- GET `/ledger/accounts/:accountId/transactions` - Get transactions
- GET `/health` - Health check

### Consumer Service
- Consumes Kafka events and writes to analytics/audit tables

## Environment Variables

See `.env.example` for all configuration options. Key variables include:
- `USE_VIRTUAL` - Toggle between real and virtual external services
- `JWT_SECRET` - Secret for JWT token signing
- Database, Redis, and Kafka connection settings

## Database Schema

The application uses a double-entry bookkeeping system with these key tables:
- `users` - User accounts and authentication
- `accounts` - Bank accounts with balances
- `transactions` - Record of financial transactions
- `ledger` - Double-entry ledger entries
- `transfers` - Fund transfer records
- `ledger_events` - Consumed Kafka events
- `audit_logs` - System audit trail
- `documents` - Uploaded document metadata

## Development

### Installing Dependencies

Each service manages its own dependencies:

```bash
cd services/auth && npm install
cd services/accounts && npm install
# ... repeat for each service
```

### Building Services

```bash
cd services/auth && npm run build
# ... repeat for each service
```

### Running Services Locally

```bash
cd services/auth && npm run dev
# ... repeat for each service
```

Note: Services expect infrastructure (PostgreSQL, Redis, Redpanda) to be running via Docker Compose.

## Testing

The application includes a comprehensive testing framework with multiple types of tests:

### Unit Tests
- Located in `services/tests/python/`
- Use pytest with mocking for isolated component testing
- Run without requiring services to be active
- Cover all major functionality of each service

### Integration Tests
- Test actual service interactions
- Require services to be running via Docker Compose
- Validate end-to-end functionality

### UI Tests
- Located in `services/tests/ui/`
- Use Playwright for browser-based testing
- Test the Admin Dashboard user interface

### End-to-End Tests
- Located in `services/tests/e2e/`
- Test complete user journeys across multiple services
- Validate entire workflows from registration to transfers

### Performance Tests
- Located in `services/tests/performance/`
- Use Locust for load testing
- Measure response times and throughput

### Security Tests
- Located in `services/tests/security/`
- Test authentication, authorization, and input validation
- Validate protection against common vulnerabilities

### Running Tests

1. Install test dependencies for each test type:
   ```bash
   # API tests
   cd services/tests/python
   pip install -r requirements.txt
   
   # UI tests
   cd ../ui
   pip install -r requirements.txt
   playwright install-deps
   playwright install chromium
   
   # E2E tests
   cd ../e2e
   pip install -r requirements.txt
   
   # Performance tests
   cd ../performance
   pip install -r requirements.txt
   
   # Security tests
   cd ../security
   pip install -r requirements.txt
   ```

2. Run all tests:
   ```bash
   cd services/tests
   python run_all_tests.py
   ```

3. For more detailed testing instructions, see [services/tests/TESTING_DOCUMENTATION.md](services/tests/TESTING_DOCUMENTATION.md)

## Admin UI

Open `http://localhost:8081` in a browser to access the administration interface for:
- Toggling mock scenarios
- Viewing audit logs
- Checking system health

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment:

### Workflows

1. **Fast Feedback Tests** - Runs on every push/PR for quick validation
2. **Enhanced Comprehensive Tests** - Full test suite with all services
3. **Security Scan** - Regular security scanning
4. **Docker Build and Publish** - Container image building and publishing

For detailed information about the GitHub Actions workflows, see [.github/workflows/README.md](.github/workflows/README.md).

### Test Automation

The project includes comprehensive automated testing:
- Unit tests with mocking
- Integration tests with real services
- UI tests with Playwright
- End-to-end tests
- Performance tests
- Security tests

For information on running tests locally, see [services/tests/HOW_TO_RUN_ALL_TESTS.md](services/tests/HOW_TO_RUN_ALL_TESTS.md).

## Scripts

- `./scripts/migrate_db.sh` - Run database migrations (Linux/macOS)
- `.\scripts\migrate_db.bat` - Run database migrations (Windows)
- `./scripts/seed_db.sh` - Populate database with sample data (Linux/macOS)
- `.\scripts\seed_db.bat` - Populate database with sample data (Windows)
- `./scripts/toggle_virtual.sh` - Switch mock scenarios
- `./scripts/kafka_read.sh` - Read messages from Kafka topic
- `./scripts/check_migrations.sh` - Check migration status

Node.js alternatives (cross-platform):
- `cd scripts && npm run migrate` - Run database migrations
- `cd scripts && npm run seed` - Populate database with sample data
- `cd scripts && npm run services` - Check service status
- `cd scripts && npm run check` - Check database seed data

## Troubleshooting

### Connection Refused Errors

If you get "ECONNREFUSED" errors when trying to connect to services:

1. Check if all services are running:
   ```bash
   cd scripts
   npm run services
   ```

2. Wait a moment for services to fully start (they need to connect to the database)

3. Check Docker logs:
   ```bash
   cd infra
   docker-compose logs auth-service
   ```

### Database Connection Issues

If services can't connect to the database:

1. Ensure PostgreSQL is running:
   ```bash
   cd infra
   docker-compose ps
   ```

2. Check database logs:
   ```bash
   cd infra
   docker-compose logs postgres
   ```

## Security Considerations

- Passwords are hashed using bcryptjs
- JWT tokens are used for authentication
- Rate limiting on transfer endpoints
- Input validation on all endpoints
- SQL injection protection through parameterized queries

## Extending the Application

The modular architecture makes it easy to add new services:
1. Create a new directory in `services/`
2. Implement the service following the existing patterns
3. Add the service to `infra/docker-compose.yml`
4. Update documentation and OpenAPI spec# GitHub Actions Fixes: Tue, Dec  2, 2025  9:29:33 PM
