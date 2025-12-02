# Fintech Microservices Tests

This directory contains all tests for the fintech microservices application.

## Directory Structure

- `python/` - Unit and integration tests
- `ui/` - UI tests using Playwright
- `e2e/` - End-to-end tests
- `performance/` - Performance and load tests
- `security/` - Security tests
- `TESTING_DOCUMENTATION.md` - Comprehensive documentation about the testing framework
- `HOW_TO_RUN_ALL_TESTS.md` - Instructions for running all tests locally
- `run_all_tests.py` - Script to run core tests
- `run_comprehensive_tests.py` - Script to run all test types

## Quick Start

1. Ensure all services are running:
   ```bash
   # From the root directory
   docker-compose up -d
   ```

2. Install all dependencies:
   ```bash
   pip install -r python/requirements.txt
   pip install -r ui/requirements.txt
   pip install -r e2e/requirements.txt
   pip install -r performance/requirements.txt
   pip install -r security/requirements.txt
   ```

3. For UI tests, install Playwright browsers:
   ```bash
   playwright install
   ```

4. Run all tests:
   ```bash
   python run_comprehensive_tests.py
   ```

## Test Categories

### Unit Tests
- Located in `python/test_*_service.py` files
- Use mocking to isolate components
- Fast execution
- Run without requiring services to be active

### Integration Tests
- Located in `python/test_*_service_integration.py` files
- Test actual service interactions
- Require services to be running
- Slower but more comprehensive

### UI Tests
- Located in `ui/` directory
- Test admin panel functionality
- Use Playwright for browser automation

### End-to-End Tests
- Located in `e2e/` directory
- Test complete user workflows
- Require all services to be running

### Performance Tests
- Located in `performance/` directory
- Test response times and throughput
- Use k6 for load testing

### Security Tests
- Located in `security/` directory
- Test authentication, authorization, and input validation
- Include static analysis with Bandit

## Running Tests

For detailed instructions on running all tests locally, see [HOW_TO_RUN_ALL_TESTS.md](HOW_TO_RUN_ALL_TESTS.md).

For comprehensive documentation about the testing framework, see [TESTING_DOCUMENTATION.md](TESTING_DOCUMENTATION.md).

## Error Handling

The test runners are designed to continue execution even when some test suites encounter issues:
- Missing dependencies will cause specific test suites to fail but won't stop the entire test run
- Network issues or service unavailability will cause integration/E2E tests to fail but won't stop other tests
- Each test suite runs independently, so failures in one suite won't affect others