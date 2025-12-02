# Fintech Microservices Testing Guide

## Table of Contents
1. [Understanding Mocking](#understanding-mocking)
2. [Testing Strategy](#testing-strategy)
3. [Manual Testing Instructions](#manual-testing-instructions)
4. [Automated Testing with GitHub Actions](#automated-testing-with-github-actions)
5. [Test Cases Coverage](#test-cases-coverage)
6. [Troubleshooting](#troubleshooting)

## Understanding Mocking

### What is Mocking?
Mocking is a technique in software testing where you replace real objects or services with simulated ones that mimic the behavior of the real components.

Think of it like using a stunt double in a movie - the stunt double looks and acts like the real actor but is safer and more controllable for specific scenes.

### Why Do We Use Mocking?

#### 1. Isolation
- Test one piece of code without depending on other components
- If your database is down, your tests shouldn't fail

#### 2. Speed
- Real database calls can take seconds
- Mock calls return instantly (milliseconds)

#### 3. Control
- You can simulate specific scenarios like:
  - Database errors
  - Network timeouts
  - Invalid responses

#### 4. Consistency
- Mocks return the same data every time
- No "flaky" tests due to external service issues

### Simple Example

Let's say you have a function that gets a user's balance from a database:

```python
# Without mocking - depends on real database
def get_user_balance(user_id):
    # This connects to a real database
    balance = database.query(f"SELECT balance FROM accounts WHERE user_id = {user_id}")
    return balance

# With mocking - uses fake database
def get_user_balance(user_id):
    # This uses a mock that always returns 1000
    balance = mock_database.query(f"SELECT balance FROM accounts WHERE user_id = {user_id}")
    return balance

# In your test
def test_get_user_balance():
    # Setup: Tell the mock what to return
    mock_database.query.return_value = 1000
    
    # Execute
    result = get_user_balance(123)
    
    # Verify
    assert result == 1000
```

## Testing Strategy

### Unit Tests vs Integration Tests

#### Use Unit Tests (with Mocks) When:
- Testing business logic
- Testing error handling
- Developing locally without internet
- You need tests to run in milliseconds
- You want to test specific code paths

Files: `test_*_service.py`

#### Use Integration Tests (with Real Services) When:
- Testing the complete flow works
- Verifying database queries are correct
- Checking API contracts
- Testing in CI/CD environments with proper setup

Files: `test_*_service_integration.py`

## Manual Testing Instructions

### Prerequisites
1. Install Python dependencies:
   ```bash
   pip install -r python/requirements.txt
   ```

2. For integration tests, start all services:
   ```bash
   cd ../../infra
   docker-compose up -d
   ```

### Running Tests

#### Option 1: Using pytest directly
```bash
# Run unit tests only (no services needed)
pytest python/test_*_service.py -v

# Run integration tests only (services must be running)
pytest python/*integration.py -v

# Run all tests
pytest python -v
```

#### Option 2: Using npm scripts
```bash
# Run unit tests only
npm run test:python-unit

# Run integration tests only
npm run test:python-integration

# Run all tests
npm run test:python
```

#### Option 3: Using Python runner script
```bash
# Run all tests
python run_tests.py

# Run unit tests only
python run_tests.py --unit

# Run integration tests only
python run_tests.py --integration

# Install dependencies and run all tests
python run_tests.py --install-deps --all
```

## Automated Testing with GitHub Actions

### CI/CD Pipeline Flow

1. **On Pull Request**:
   - Run unit tests only (fast feedback)
   - Triggered automatically when code is pushed

2. **On Merge to Main**:
   - Run both unit and integration tests
   - Deploy to staging environment

3. **Nightly Builds**:
   - Run full test suite including performance tests

### GitHub Actions Configuration Example

```yaml
name: CI Tests

on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.9
    - name: Install dependencies
      run: |
        pip install -r services/tests/python/requirements.txt
    - name: Run unit tests
      run: |
        pytest services/tests/python/test_*_service.py -v

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v2
    - name: Start services
      run: |
        cd infra
        docker-compose up -d
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.9
    - name: Install dependencies
      run: |
        pip install -r services/tests/python/requirements.txt
    - name: Run integration tests
      run: |
        pytest services/tests/python/*integration.py -v
```

## Test Cases Coverage

### Auth Service Tests

#### Unit Tests (`test_auth_service.py`)
1. `test_register_new_user_success` - Test successful user registration
2. `test_register_missing_credentials` - Test registration with missing email or password
3. `test_register_duplicate_user` - Test registration with existing user
4. `test_login_success` - Test successful user login
5. `test_login_invalid_credentials` - Test login with invalid credentials

#### Integration Tests (`test_auth_service_integration.py`)
1. `test_register_new_user_success` - Test successful user registration with actual service
2. `test_register_duplicate_user` - Test registration with existing user
3. `test_login_success` - Test successful user login
4. `test_login_invalid_credentials` - Test login with invalid credentials

### Accounts Service Tests

#### Unit Tests (`test_accounts_service.py`)
1. `test_get_accounts_success` - Test successful retrieval of user accounts
2. `test_get_accounts_unauthorized` - Test getting accounts without authentication
3. `test_get_account_balance_success` - Test successful retrieval of account balance
4. `test_get_account_balance_not_found` - Test getting balance for non-existent account
5. `test_deposit_success` - Test successful deposit to account
6. `test_withdraw_success` - Test successful withdrawal from account
7. `test_withdraw_insufficient_funds` - Test withdrawal with insufficient funds

#### Integration Tests (`test_accounts_service_integration.py`)
1. `test_get_accounts_success` - Test successful retrieval of user accounts
2. `test_get_accounts_unauthorized` - Test getting accounts without authentication
3. `test_get_account_balance_success` - Test successful retrieval of account balance
4. `test_deposit_funds_success` - Test successful deposit to account

### Transfer Service Tests

#### Unit Tests (`test_transfer_service.py`)
1. `test_initiate_transfer_success` - Test successful fund transfer initiation
2. `test_initiate_transfer_insufficient_funds` - Test transfer with insufficient funds
3. `test_initiate_transfer_missing_idempotency_key` - Test transfer without idempotency key
4. `test_get_transfer_status_success` - Test successful retrieval of transfer status
5. `test_get_transfer_status_not_found` - Test getting status for non-existent transfer

### Ledger Service Tests

#### Unit Tests (`test_ledger_service.py`)
1. `test_get_ledger_entries_success` - Test successful retrieval of ledger entries
2. `test_get_ledger_entries_invalid_account_id` - Test getting ledger entries with invalid account ID
3. `test_get_transactions_success` - Test successful retrieval of transactions
4. `test_get_transactions_empty_results` - Test getting transactions with no results

### Consumer Service Tests

#### Unit Tests (`test_consumer_service.py`)
(Note: Would be implemented similarly to other services)
1. Test processing valid Kafka messages
2. Test handling invalid message formats
3. Test handling database errors gracefully
4. Test service startup scenarios

## Troubleshooting

### Common Issues

#### 1. Tests failing with connection errors
**Problem**: Integration tests failing because services aren't running
**Solution**: 
```bash
cd ../../infra
docker-compose up -d
```

#### 2. ImportError: No module named 'pytest'
**Problem**: Python dependencies not installed
**Solution**:
```bash
pip install -r python/requirements.txt
```

#### 3. Tests running slowly
**Problem**: Running integration tests instead of unit tests
**Solution**: Run unit tests only:
```bash
pytest python/test_*_service.py -v
```

#### 4. Tests failing inconsistently
**Problem**: Using real services in unit tests
**Solution**: Use mocks for unit tests and real services only for integration tests

### Debugging Tips

1. **Run a single test**:
   ```bash
   pytest python/test_auth_service.py::TestAuthService::test_register_new_user_success -v
   ```

2. **Run with debug output**:
   ```bash
   pytest python -v -s
   ```

3. **Check what tests would run without running them**:
   ```bash
   pytest python --collect-only
   ```

### Performance Considerations

1. **Unit tests** should run in < 1 second total
2. **Integration tests** may take 10-30 seconds depending on service startup time
3. **Use parallel execution** for faster results:
   ```bash
   pytest python -v -n auto
   ```

---

*This guide provides a comprehensive overview of the testing approach for the fintech microservices application. For questions or issues, please contact the development team.*