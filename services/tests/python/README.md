# Python Unit and Integration Tests

This directory contains both unit tests (using mocks) and integration tests (using actual services) for all microservices in the fintech application.

## Test Types

### Unit Tests (`test_*_service.py`)
- Use mocks to isolate specific functionality
- Run very quickly (milliseconds)
- Test individual functions and methods
- Don't require services to be running
- Focus on code logic and edge cases

### Integration Tests (`test_*_service_integration.py`)
- Make actual requests to running services
- Test the complete flow through the system
- Require all services to be running
- Test real database interactions
- Test actual HTTP responses

## Running Tests

### Unit Tests
```bash
# Run all unit tests
pytest tests/python -v

# Run specific service unit tests
pytest tests/python/test_auth_service.py -v
pytest tests/python/test_accounts_service.py -v
pytest tests/python/test_transfer_service.py -v
pytest tests/python/test_ledger_service.py -v
```

### Integration Tests
```bash
# Run all integration tests
pytest tests/python/*integration.py -v

# Run specific service integration tests
pytest tests/python/test_auth_service_integration.py -v
```

## Test Configuration

The tests use the configuration defined in [test_config.py](./test_config.py):

- Database settings for tests
- Redis and Kafka configuration
- JWT secrets
- Test data factories
- External service mocks

## Continuous Integration

For GitHub Actions and other CI environments:

1. Unit tests can run without any external services
2. Integration tests require:
   - All microservices to be built and running
   - PostgreSQL database
   - Redis server
   - Kafka/Redpanda
   - Proper environment variables

## Benefits of This Approach

1. **Fast Feedback**: Unit tests provide immediate feedback during development
2. **Reliability**: Unit tests are not affected by network issues or service outages
3. **Comprehensive Coverage**: Integration tests verify the complete system works together
4. **Flexibility**: Can run either type of test depending on needs
5. **CI Compatibility**: Unit tests work in any environment; integration tests work in properly configured environments

## Writing New Tests

When adding new tests, consider:

1. **Unit Test First**: Write unit tests to verify logic and edge cases
2. **Integration Test for Flows**: Write integration tests for complete user flows
3. **Use Fixtures**: Leverage the predefined fixtures in [conftest.py](./conftest.py)
4. **Follow Patterns**: Use the existing test patterns and naming conventions