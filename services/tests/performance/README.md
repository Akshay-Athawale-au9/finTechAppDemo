# Performance Tests

This directory contains performance and load tests for the fintech application.

## Directory Structure

```
performance/
├── k6_script.js            # Load testing with k6
├── test_api_performance.py # API performance tests
└── requirements.txt        # Performance testing dependencies
```

## Prerequisites

1. Python 3.10+
2. k6 installed (https://k6.io/docs/get-started/installation/)
3. All services must be running (via `docker-compose up`)
4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Performance Testing Tools

### 1. k6 Load Testing

k6 is used for simulating heavy load on the application.

#### Running k6 Tests

```bash
cd d:\Interview\fintechApplciaitioon\services\tests\performance
k6 run k6_script.js
```

#### k6 Test Scenarios

1. **User Authentication** - Simulates login requests
2. **Account Management** - Simulates account retrieval requests
3. **Fund Transfers** - Simulates fund transfer requests

### 2. API Performance Tests

Pytest-based performance tests that measure response times and throughput.

#### Running API Performance Tests

```bash
cd d:\Interview\fintechApplciaitioon\services\tests\performance
python -m pytest test_api_performance.py -v
```

#### Test Coverage

1. `test_auth_service_response_time` - Measures auth service response time
2. `test_concurrent_logins` - Tests concurrent login requests
3. `test_accounts_service_response_time` - Measures accounts service response time
4. `test_transfer_service_throughput` - Tests transfer service throughput

## Performance Metrics

Tests validate the following performance criteria:

- Auth service response time < 500ms
- Accounts service response time < 1000ms
- Transfer service throughput > 0.5 transfers/second
- Concurrent request success rate > 60%

## Test Data

Performance tests use the test user:
- Email: `akshay@example.com`
- Password: `password123`

## Resource Requirements

For accurate performance testing, ensure adequate system resources:
- CPU: 4+ cores
- RAM: 8GB+
- Network: Stable connection

## Troubleshooting

If you see import errors in your IDE for performance test files, this is normal when dependencies are not installed in your development environment. The files will work correctly when dependencies are installed via `pip install -r requirements.txt`.