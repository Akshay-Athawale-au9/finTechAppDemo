# Fintech Microservice Application - Project Summary

## Overview

This project implements a complete, runnable fintech microservice application architecture with core business flows including authentication, account management, fund transfers, and event-driven processing. The application is designed to be lightweight and runnable on a developer laptop.

## Implemented Components

### 1. Services
- **Auth Service** (Port 3001): User registration, authentication, JWT tokens
- **Accounts Service** (Port 3002): Account management and balance operations
- **Transfer Service** (Port 3003): Fund transfers with idempotency and external integrations
- **Ledger Service** (Port 3004): Double-entry bookkeeping and transaction recording
- **Consumer Service**: Event consumption for analytics and audit logging

### 2. Infrastructure
- **PostgreSQL**: Primary database with migrations
- **Redis**: Caching and rate limiting
- **Redpanda**: Lightweight Kafka alternative for event streaming
- **WireMock**: Service virtualization for external dependencies
- **Admin UI**: Simple interface for toggling mock scenarios

### 3. Core Features Implemented

#### Authentication & Users
- POST /auth/register: Register user with email, password, roles
- POST /auth/login: Returns JWT access + refresh tokens
- POST /auth/refresh: Token refresh endpoint
- GET /health and GET /metrics endpoints

#### Accounts & Balances
- GET /accounts: List user accounts
- GET /accounts/:id/balance: Returns current balance
- POST /accounts/:id/deposit: Create deposit transaction and ledger entry
- POST /accounts/:id/withdraw: Withdraw with balance check and proper transactional handling

#### Fund Transfer Flow
- POST /transfer: Initiates transfer with idempotency semantics
- GET /transfer/:id/status: Returns transfer status
- Implements double-entry bookkeeping with ledger and transactions tables
- Publishes LEDGER_UPDATED events to Kafka on success

#### OTP & External Integrations
- Internal /external/otp/verify endpoint
- WireMock stubs for OTP and payment gateway (fast/success, slow, error scenarios)
- Environment flag to switch between internal service or WireMock

#### Payment Gateway & Fraud Detection
- POST /external/payment/process stub
- Simple fraud detection logic with risk scoring
- Rate limiting on payment endpoints using Redis

#### Event-driven Processing
- Publishes events to Kafka topic ledger-events when transfers complete
- Consumer service listens to ledger-events and writes to analytics table and audit log

#### Webhooks
- POST /webhook/payment: Validates signature header and accepts external webhook notifications
- Helper script to POST test webhook events

#### Pagination & File Management
- GET /transactions?page=&size=: Paginated transactions with metadata
- POST /documents/upload: File upload with type/size validation

#### Administration
- Admin endpoints to check DB migration status
- View recent audit logs
- Toggle mock scenarios via admin UI

### 4. Data Management
- **Migrations**: Database schema creation scripts
- **Seed Data**: Sample users, accounts, and balances
- **Scripts**: 
  - seed_db.sh: Populate sample data
  - toggle_virtual.sh: Switch virtualization modes
  - kafka_read.sh: Read messages from Kafka topic

### 5. Developer Experience
- **Docker Compose**: Single command to run all services
- **Environment Configuration**: .env.example for configs
- **Health Checks**: All services expose /health endpoints
- **Documentation**: OpenAPI specification for all endpoints
- **CI Pipeline**: GitHub Actions workflow for linting and building

## Technology Stack

- **Backend**: Node.js + Express (TypeScript)
- **Database**: PostgreSQL with migrations
- **Message Broker**: Redpanda (lightweight Kafka)
- **Cache/Rate Limiter**: Redis
- **Mocking**: WireMock (Docker)
- **Containerization**: Docker + Docker Compose
- **Admin UI**: Simple HTML/JavaScript dashboard
- **Logging**: Structured JSON logs
- **Configuration**: Environment variables

## How to Run

1. Copy `.env.example` to `.env` and adjust values
2. Run `docker-compose up` in the infra directory
3. Run `./scripts/seed_db.sh` to populate sample data
4. Access services via their respective ports
5. Use admin UI at http://localhost:8081 to toggle mock scenarios

## Key Architectural Decisions

1. **Microservices**: Each service has its own database connection and responsibilities
2. **Event-Driven**: Kafka/Redpanda for asynchronous communication
3. **Idempotency**: Transfer service implements idempotency keys
4. **Double-Entry Bookkeeping**: Financial transactions follow accounting principles
5. **Service Virtualization**: WireMock for external dependency simulation
6. **Security**: JWT authentication, rate limiting, input validation
7. **Observability**: Health checks, audit logs, structured logging

## Future Enhancements

1. **Enhanced Security**: OAuth2, certificate-based authentication
2. **Advanced Fraud Detection**: Machine learning models
3. **Multi-Currency Support**: Currency conversion services
4. **Notification Service**: Email/SMS notifications
5. **Compliance Reporting**: Regulatory reporting features
6. **Performance Monitoring**: Metrics collection and dashboards
7. **Backup and Recovery**: Automated backup strategies