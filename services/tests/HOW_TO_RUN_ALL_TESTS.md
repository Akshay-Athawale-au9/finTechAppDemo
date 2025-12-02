# How to Execute All Tests Locally

This guide explains how to run all tests for the fintech microservices application locally.

## Prerequisites

1. Python 3.10+
2. Node.js 18+
3. Docker and Docker Compose
4. All services must be running (see below)

## Starting the Services

Before running tests, you need to start all microservices:

```bash
# Navigate to the root directory
cd d:\Interview\fintechApplciaitioon

# Start all services with Docker Compose
docker-compose up -d

# Wait for services to initialize (1-2 minutes)
```

## Installing Test Dependencies

Install dependencies for all test types:

```bash
# Navigate to the tests directory
cd d:\Interview\fintechApplciaitioon\services\tests

# Install core Python testing dependencies
pip install -r python/requirements.txt

# Install UI testing dependencies
pip install -r ui/requirements.txt

# Install security testing dependencies
pip install -r security/requirements.txt

# Install E2E testing dependencies
pip install -r e2e/requirements.txt

# Install performance testing dependencies
pip install -r performance/requirements.txt
```

Note: For UI tests, you also need to install Playwright browsers:
```bash
playwright install
```

## Running All Tests

### Option 1: Using the Comprehensive Test Runner (Recommended)

```bash
# Navigate to the tests directory
cd d:\Interview\fintechApplciaitioon\services\tests

# Run all tests with detailed output
python run_comprehensive_tests.py
```

### Option 2: Using Platform-Specific Scripts

#### On Windows:
Double-click [run_all_tests.bat](file:///d:/Interview/fintechApplciaitioon/services/tests/run_all_tests.bat) or run from command prompt:
```cmd
run_all_tests.bat
```

#### On Unix/Linux/macOS:
```bash
./run_all_tests.sh
```

### Option 3: Using the Simple Test Runner

```bash
# Navigate to the tests directory
cd d:\Interview\fintechApplciaitioon\services\tests

# Run all tests
python run_all_tests.py
```

### Option 4: Manual Execution by Test Type

#### 1. Unit and Integration Tests
```bash
cd d:\Interview\fintechApplciaitioon\services\tests
python -m pytest python/ -v
```

#### 2. UI Tests
```bash
cd d:\Interview\fintechApplciaitioon\services\tests
python -m pytest ui/ -v
```

#### 3. End-to-End Tests
```bash
cd d:\Interview\fintechApplciaitioon\services\tests
python -m pytest e2e/ -v
```

#### 4. Performance Tests
```bash
cd d:\Interview\fintechApplciaitioon\services\tests
python -m pytest performance/ -v
```

#### 5. Security Tests
```bash
cd d:\Interview\fintechApplciaitioon\services\tests
python -m pytest security/ -v
```

## Running Specific Test Suites

### Run Only Unit Tests
```bash
cd d:\Interview\fintechApplciaitioon\services\tests
python -m pytest python/test_*_service.py -v
```

### Run Only Integration Tests
```bash
cd d:\Interview\fintechApplciaitioon\services\tests
python -m pytest python/*integration.py -v
```

### Run Only Security Tests
```bash
cd d:\Interview\fintechApplciaitioon\services\tests
python -m pytest security/test_*.py -v
```

## Test Credentials

All tests use the following test user credentials:
- Email: `akshay@example.com`
- Password: `password123`

Make sure this user exists in your system. If not, you can create it by registering through the auth service.

## Expected Results

1. **Unit Tests**: Should all pass (mocked services)
2. **Integration Tests**: Should all pass when dependencies are installed and services are running
3. **UI Tests**: May have some failures in headless environments
4. **E2E Tests**: Should all pass when services are running
5. **Performance Tests**: May have some failures if hardware doesn't meet requirements
6. **Security Tests**: Should all pass when services are running

## Error Handling

The test runners are designed to continue execution even when some test suites fail:
- Missing dependencies will cause specific test suites to fail but won't stop the entire test run
- Network issues or service unavailability will cause integration/E2E tests to fail but won't stop other tests
- Each test suite runs independently, so failures in one suite won't affect others

## Troubleshooting

### Services Not Running
If tests fail due to connection issues:
1. Ensure Docker is running
2. Run `docker-compose up -d` from the root directory
3. Wait 1-2 minutes for services to initialize

### Dependency Issues
If you encounter import errors:
1. Make sure all requirements.txt files are installed
2. For UI tests, run `playwright install`

### Test User Doesn't Exist
If authentication tests fail:
1. Register the test user manually through the auth service
2. Or run the seeding scripts in the database

### Permission Issues
On Windows, you might need to run the commands as Administrator if you encounter permission errors.

## CI/CD Integration

The test suite is designed to run in CI/CD pipelines. The [run_comprehensive_tests.py](file:///d:/Interview/fintechApplciaitioon/services/tests/run_comprehensive_tests.py) script handles:
- Running all test types
- Graceful failure handling
- Proper error reporting
- Continuing execution even when some suites fail

### GitHub Actions

This project includes several GitHub Actions workflows:

1. **Fast Feedback Tests** - Quick validation on every push/PR
2. **Enhanced Comprehensive Tests** - Full test suite with all services
3. **Security Scan** - Regular security scanning
4. **Docker Build and Publish** - Container image building and publishing

For detailed information about the GitHub Actions workflows, see [.github/workflows/README.md](../../.github/workflows/README.md).

### Local vs CI Execution

While the test runners are designed to work both locally and in CI environments, there are some differences:

**Local Execution:**
- Requires manual setup of services (Docker Compose)
- Interactive execution with real-time feedback
- Ability to debug and inspect failures immediately

**CI Execution:**
- Automated service provisioning using GitHub Actions services
- Structured reporting and artifact storage
- Scheduled runs for continuous validation
- Parallel execution for faster feedback

Both environments use the same test scripts and configurations, ensuring consistency between local development and CI validation.
