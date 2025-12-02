# Fintech Microservices Testing Documentation

## Overview

This document provides comprehensive information about the testing architecture for the fintech microservices application. It covers all types of tests including unit tests, integration tests, UI tests, end-to-end tests, performance tests, and security tests, and explains the testing flow and how to run tests manually and automatically.

## Test Architecture

The testing framework consists of multiple types of tests:

1. **Unit Tests**: Mock-based tests that verify individual functions and components without requiring actual services to be running
2. **Integration Tests**: Real-service tests that verify the complete functionality by interacting with actual running services
3. **UI Tests**: Browser-based tests that verify the user interface works correctly
4. **End-to-End Tests**: Complete user journey tests that validate entire workflows
5. **Performance Tests**: Tests that measure response times, throughput, and system behavior under load
6. **Security Tests**: Tests that validate authentication, authorization, and input validation

## Test Structure

```
tests/
├── python/                          # API Unit and Integration Tests
│   ├── test_auth_service.py                 # Unit tests for Auth Service
│   ├── test_auth_service_integration.py     # Integration tests for Auth Service
│   ├── test_accounts_service.py             # Unit tests for Accounts Service
│   ├── test_accounts_service_integration.py # Integration tests for Accounts Service
│   ├── test_transfer_service.py             # Unit tests for Transfer Service
│   ├── test_ledger_service.py               # Unit tests for Ledger Service
│   ├── test_config.py                      # Shared test configuration and data factories
│   ├── conftest.py                         # pytest configuration and fixtures
│   └── __init__.py                         # Package initialization
├── ui/                              # UI Tests
│   ├── test_admin_ui.py                     # Tests for Admin Dashboard
│   ├── conftest.py                         # pytest configuration for UI tests
│   ├── requirements.txt                    # UI testing dependencies
│   └── README.md                           # UI testing documentation
├── e2e/                             # End-to-End Tests
│   ├── test_complete_user_flow.py           # Complete user journey tests
│   ├── requirements.txt                    # E2E testing dependencies
│   └── README.md                           # E2E testing documentation
├── performance/                     # Performance Tests
│   ├── locustfile.py                       # Load testing with Locust
│   ├── test_api_performance.py             # API performance tests
│   ├── requirements.txt                    # Performance testing dependencies
│   └── README.md                           # Performance testing documentation
├── security/                        # Security Tests
│   ├── test_authentication_security.py      # Authentication security tests
│   ├── test_authorization_security.py       # Authorization security tests
│   ├── test_input_validation.py            # Input validation tests
│   ├── requirements.txt                    # Security testing dependencies
│   └── README.md                           # Security testing documentation
├── run_all_tests.py                        # Script to run all tests
└── TESTING_DOCUMENTATION.md                # This documentation
```

## Test Coverage by Service

### Auth Service

#### Unit Tests (`python/test_auth_service.py`)
1. `test_register_new_user_success` - Tests successful user registration with account creation
2. `test_register_missing_credentials` - Tests registration with missing email or password
3. `test_register_duplicate_user` - Tests registration with existing user
4. `test_login_success` - Tests successful user login
5. `test_login_invalid_credentials` - Tests login with invalid credentials

#### Integration Tests (`python/test_auth_service_integration.py`)
1. `test_register_new_user_success` - Tests actual user registration with real service
2. `test_register_duplicate_user` - Tests registration with existing user on real service
3. `test_login_success` - Tests actual user login with real service
4. `test_login_invalid_credentials` - Tests login with invalid credentials on real service

### Accounts Service

#### Unit Tests (`python/test_accounts_service.py`)
1. `test_get_accounts_success` - Tests successful retrieval of user accounts
2. `test_get_accounts_unauthorized` - Tests getting accounts without authentication
3. `test_get_account_balance_success` - Tests successful retrieval of account balance
4. `test_get_account_balance_not_found` - Tests getting balance for non-existent account
5. `test_deposit_success` - Tests successful deposit to account
6. `test_withdraw_success` - Tests successful withdrawal from account
7. `test_withdraw_insufficient_funds` - Tests withdrawal with insufficient funds

#### Integration Tests (`python/test_accounts_service_integration.py`)
1. `test_get_accounts_success` - Tests actual retrieval of user accounts from real service
2. `test_get_accounts_unauthorized` - Tests getting accounts without authentication on real service
3. `test_get_account_balance_success` - Tests actual retrieval of account balance from real service
4. `test_deposit_funds_success` - Tests actual deposit to account on real service

### Transfer Service

#### Unit Tests (`python/test_transfer_service.py`)
1. `test_initiate_transfer_success` - Tests successful fund transfer initiation
2. `test_initiate_transfer_insufficient_funds` - Tests transfer with insufficient funds
3. `test_initiate_transfer_missing_idempotency_key` - Tests transfer without idempotency key
4. `test_get_transfer_status_success` - Tests successful retrieval of transfer status
5. `test_get_transfer_status_not_found` - Tests getting status for non-existent transfer

### Ledger Service

#### Unit Tests (`python/test_ledger_service.py`)
1. `test_get_ledger_entries_success` - Tests successful retrieval of ledger entries
2. `test_get_ledger_entries_invalid_account_id` - Tests getting ledger entries with invalid account ID
3. `test_get_transactions_success` - Tests successful retrieval of transactions
4. `test_get_transactions_empty_results` - Tests getting transactions with no results

### UI Tests (`ui/test_admin_ui.py`)
1. `test_dashboard_loads_successfully` - Verifies the admin dashboard loads correctly
2. `test_toggle_mock_scenarios` - Tests toggling between different mock scenarios
3. `test_view_audit_logs` - Tests viewing audit logs in the dashboard
4. `test_check_system_health` - Tests checking system health status

### End-to-End Tests (`e2e/test_complete_user_flow.py`)
1. `test_complete_user_registration_to_transfer_flow` - Tests the complete flow from user registration to fund transfer
2. `test_user_account_balance_updates_after_transfer` - Tests that account balances update correctly after a transfer

### Performance Tests
1. `test_auth_service_response_time` - Measures auth service response time
2. `test_concurrent_logins` - Tests concurrent login requests
3. `test_accounts_service_response_time` - Measures accounts service response time
4. `test_transfer_service_throughput` - Tests transfer service throughput
5. Locust-based load tests for all services

### Security Tests
1. `test_jwt_token_expiration` - Validates JWT token expiration times
2. `test_password_strength_requirements` - Tests password strength enforcement
3. `test_brute_force_protection` - Verifies brute force attack protection
4. `test_sql_injection_in_auth_endpoints` - Tests SQL injection protection
5. `test_access_without_token` - Ensures endpoints require authentication
6. `test_cross_user_account_access` - Prevents users from accessing other users' data
7. `test_transfer_amount_validation` - Validates transfer amount inputs
8. `test_account_id_validation` - Validates account ID inputs

## How to Run Tests Manually

### Prerequisites
1. Python 3.10+
2. All services must be running (via `docker-compose up`)
3. Install dependencies for each test type:
   ```bash
   # API tests
   cd python
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

### Running Unit Tests
To run all unit tests:
```bash
cd d:\Interview\fintechApplciaitioon\services\tests
python -m pytest python/test_auth_service.py python/test_accounts_service.py python/test_transfer_service.py python/test_ledger_service.py -v
```

To run unit tests for a specific service:
```bash
cd d:\Interview\fintechApplciaitioon\services\tests
python -m pytest python/test_auth_service.py -v
```

### Running Integration Tests
To run all integration tests:
```bash
cd d:\Interview\fintechApplciaitioon\services\tests
python -m pytest python/test_auth_service_integration.py python/test_accounts_service_integration.py -v
```

To run integration tests for a specific service:
```bash
cd d:\Interview\fintechApplciaitioon\services\tests
python -m pytest python/test_auth_service_integration.py -v
```

### Running UI Tests
```bash
cd d:\Interview\fintechApplciaitioon\services\tests\ui
python -m pytest test_admin_ui.py -v
```

### Running E2E Tests
```bash
cd d:\Interview\fintechApplciaitioon\services\tests\e2e
python -m pytest test_complete_user_flow.py -v
```

### Running Performance Tests
```bash
# API performance tests
cd d:\Interview\fintechApplciaitioon\services\tests\performance
python -m pytest test_api_performance.py -v

# Load testing with Locust
locust
```

### Running Security Tests
```bash
cd d:\Interview\fintechApplciaitioon\services\tests\security
python -m pytest test_authentication_security.py test_authorization_security.py test_input_validation.py -v
```

### Running All Tests
To run all tests (unit, integration, UI, E2E, performance, and security):
```bash
cd d:\Interview\fintechApplciaitioon\services\tests
python run_all_tests.py
```

## Automated Testing with Git

### Pre-commit Hooks
Tests can be automatically triggered before each commit by setting up pre-commit hooks:

1. Install pre-commit: `pip install pre-commit`
2. Add a `.pre-commit-config.yaml` file to the repository root:
```yaml
repos:
  - repo: local
    hooks:
      - id: unit-tests
        name: Run Unit Tests
        entry: python -m pytest services/tests/python/test_auth_service.py services/tests/python/test_accounts_service.py services/tests/python/test_transfer_service.py services/tests/python/test_ledger_service.py
        language: system
        pass_filenames: false
      - id: security-tests
        name: Run Security Tests
        entry: python -m pytest services/tests/security/
        language: system
        pass_filenames: false
```
3. Install the hook: `pre-commit install`

### CI/CD Pipeline
In a continuous integration pipeline (e.g., GitHub Actions), all test types can be triggered automatically on each push:

Example GitHub Actions workflow (`.github/workflows/test.yml`):
```yaml
name: Run All Tests
on: [push, pull_request]
jobs:
  unit-integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.10
      - name: Install API test dependencies
        run: |
          cd services/tests/python
          pip install -r requirements.txt
      - name: Run unit tests
        run: |
          cd services/tests
          python -m pytest python/test_auth_service.py python/test_accounts_service.py python/test_transfer_service.py python/test_ledger_service.py
      - name: Start services and run integration tests
        run: |
          # Start services with docker-compose
          cd infra
          docker-compose up -d
          # Wait for services to start
          sleep 30
          # Run integration tests
          cd ../services/tests
          python -m pytest python/test_auth_service_integration.py python/test_accounts_service_integration.py
  
  ui-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.10
      - name: Install UI test dependencies
        run: |
          cd services/tests/ui
          pip install -r requirements.txt
          playwright install-deps
          playwright install chromium
      - name: Start services
        run: |
          cd infra
          docker-compose up -d
          sleep 30
      - name: Run UI tests
        run: |
          cd services/tests/ui
          python -m pytest test_admin_ui.py -v
  
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.10
      - name: Install E2E test dependencies
        run: |
          cd services/tests/e2e
          pip install -r requirements.txt
      - name: Start services
        run: |
          cd infra
          docker-compose up -d
          sleep 30
      - name: Run E2E tests
        run: |
          cd services/tests/e2e
          python -m pytest test_complete_user_flow.py -v
  
  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.10
      - name: Install performance test dependencies
        run: |
          cd services/tests/performance
          pip install -r requirements.txt
      - name: Start services
        run: |
          cd infra
          docker-compose up -d
          sleep 30
      - name: Run performance tests
        run: |
          cd services/tests/performance
          python -m pytest test_api_performance.py -v
  
  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.10
      - name: Install security test dependencies
        run: |
          cd services/tests/security
          pip install -r requirements.txt
      - name: Start services
        run: |
          cd infra
          docker-compose up -d
          sleep 30
      - name: Run security tests
        run: |
          cd services/tests/security
          python -m pytest test_authentication_security.py test_authorization_security.py test_input_validation.py -v
      - name: Run bandit security scan
        run: |
          pip install bandit
          bandit -r services/
      - name: Check for vulnerable dependencies
        run: |
          pip install safety
          safety check
```

## Test Configuration

The [test_config.py](file://d:\Interview\fintechApplciaitioon\services\tests\python\test_config.py) file contains:
- Test environment configuration
- Test data factories for creating consistent test data
- Utility functions for generating random test data
- Mock implementations of external services

The [conftest.py](file://d:\Interview\fintechApplciaitioon\services\tests\python\conftest.py) file contains:
- pytest fixtures for commonly used mock objects
- Path configuration to import service modules

## Mocking Concept Explanation

### What is Mocking?
Mocking is a technique used in unit testing where we replace real objects or functions with simulated versions that mimic the behavior of the real ones. This allows us to:

1. Test components in isolation
2. Control the behavior of dependencies
3. Simulate different scenarios (success, failure, edge cases)
4. Speed up tests by avoiding slow operations (database calls, network requests)

### Examples in Our Tests

1. **Database Pool Mocking**:
   ```python
   # In conftest.py
   @pytest.fixture
   def mock_db_pool():
       """Create a mock database pool"""
       pool = Mock()
       pool.query = Mock()
       pool.connect = Mock()
       return pool
   ```

2. **HTTP Request/Response Mocking**:
   ```python
   # In conftest.py
   @pytest.fixture
   def mock_request():
       """Create a mock HTTP request object"""
       request = Mock()
       request.body = {}
       request.params = {}
       request.headers = {}
       return request
   ```

3. **Using Mocks in Tests**:
   ```python
   def test_register_new_user_success(self, mock_request, mock_response, mock_db_pool):
       """Test successful user registration"""
       # Configure the mock to return specific values
       mock_db_pool.query.side_effect = [
           Mock(rows=[]),  # Check if user exists
           Mock(rows=[{'id': 1, 'email': 'test@example.com', 'roles': ['user']}]),  # Insert user
           Mock(rows=[{  # Create account
               'id': 1, 
               'account_number': 'ACC001123', 
               'account_type': 'checking', 
               'balance': 0.00, 
               'currency': 'USD', 
               'status': 'active', 
               'created_at': '2023-01-01'
           }])
       ]
       
       # The rest of the test...
   ```

## Test Results Summary

- **Total Unit Tests**: 21
- **Total Integration Tests**: 8
- **Total UI Tests**: 4
- **Total E2E Tests**: 2
- **Total Performance Tests**: 4
- **Total Security Tests**: 8
- **Total Tests**: 47
- **Current Status**: All tests passing

## Troubleshooting

### Common Issues and Solutions

1. **Import Errors**:
   - Ensure you're running tests from the `services/tests` directory
   - Make sure all Python dependencies are installed

2. **Service Connection Issues (Integration Tests)**:
   - Ensure all services are running (`docker-compose up`)
   - Check that the ports in the test configuration match the service ports

3. **Database Connection Issues**:
   - Verify database credentials in [test_config.py](file://d:\Interview\fintechApplciaitioon\services\tests\python\test_config.py)
   - For integration tests, ensure the database is accessible

4. **Browser-related Issues (UI Tests)**:
   - Ensure Playwright is properly installed with `playwright install-deps` and `playwright install chromium`
   - Check that the admin UI is accessible at http://localhost:8081

### Test Maintenance

To add new tests:
1. Create a new test method in the appropriate test file
2. Use descriptive names following the pattern `test_[what_is_being_tested]_[expected_result]`
3. Follow the AAA pattern (Arrange, Act, Assert)
4. Run tests to ensure they pass

To modify existing tests:
1. Update the test logic as needed
2. Update assertions to match new expected behavior
3. Run tests to ensure they still pass