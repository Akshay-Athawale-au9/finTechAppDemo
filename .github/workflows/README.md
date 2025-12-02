# GitHub Actions Workflows

This directory contains all the GitHub Actions workflows for the fintech microservices application.

## Available Workflows

### 1. Fast Feedback Tests (`fast-feedback-tests.yml`)
- **Trigger**: Runs on every push and pull request to `main` and `develop` branches
- **Purpose**: Provides quick feedback on code changes
- **Includes**: 
  - Unit tests
  - TypeScript compilation checks
  - Basic linting
- **Runtime**: ~2-3 minutes

### 2. Enhanced Comprehensive Tests (`enhanced-comprehensive-tests.yml`)
- **Trigger**: Runs on push/pull request to `main`/`develop`, daily scheduled runs, and manual triggers
- **Purpose**: Full test suite execution with all services
- **Includes**:
  - All unit tests
  - All integration tests
  - UI tests with Playwright
  - End-to-end tests
  - Performance tests
  - Security tests
  - Static analysis with Bandit
  - Dependency vulnerability checks with Safety
- **Runtime**: ~15-20 minutes
- **Services**: Uses GitHub Actions services for PostgreSQL, Redis, and Redpanda

### 3. Security Scan (`security-scan.yml`)
- **Trigger**: Runs on push/pull request and weekly scheduled runs
- **Purpose**: Security-focused scanning
- **Includes**:
  - Bandit static analysis
  - Safety dependency vulnerability checks
- **Runtime**: ~2-3 minutes

### 4. Docker Build and Publish (`docker-build-publish.yml`)
- **Trigger**: Runs on pushes to `main` branch and version tags
- **Purpose**: Build and publish Docker images
- **Includes**:
  - Builds Docker images for all services
  - Publishes to GitHub Container Registry (GHCR)
- **Runtime**: ~5-10 minutes

### 5. Existing Workflows
- `ci.yml`: Original CI pipeline (build and basic tests)
- `comprehensive-tests.yml`: Original fragmented comprehensive tests

## Workflow Triggers

| Event | Fast Feedback | Comprehensive | Security Scan | Docker Build |
|-------|---------------|---------------|---------------|--------------|
| Push to main/develop | ✅ | ✅ | ✅ | ✅ |
| Pull Request | ✅ | ✅ | ✅ | ❌ |
| Scheduled | ❌ | ✅ (daily) | ✅ (weekly) | ❌ |
| Manual Trigger | ❌ | ✅ | ✅ | ❌ |
| Tag Push | ❌ | ❌ | ❌ | ✅ |

## Environment Variables

The workflows use the following environment variables:

- `DATABASE_URL`: Connection string for PostgreSQL
- `REDIS_URL`: Connection string for Redis
- `KAFKA_BROKER`: Address for Kafka/Redpanda broker
- `WIREMOCK_URL`: Address for WireMock service

## Secrets

For Docker image publishing, the workflows use:
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

## Test User

All tests use the predefined test user:
- Email: `akshay@example.com`
- Password: `password123`

Ensure this user exists in your test database or is created during the seeding process.

## Customization

To customize these workflows:

1. **Change schedule**: Modify the `cron` expressions in the `schedule` triggers
2. **Add/remove test types**: Edit the test execution commands in each job
3. **Adjust matrix strategies**: Modify the `strategy.matrix` sections to test different versions
4. **Add notifications**: Integrate with Slack, Discord, or other notification services
5. **Modify resource allocation**: Adjust `runs-on` labels for different runner types

## Troubleshooting

### Common Issues

1. **Tests failing due to missing dependencies**: 
   - Ensure all `requirements.txt` files are properly maintained
   - Check that the installation steps in workflows match local setup

2. **Database connection issues**:
   - Verify service configurations in the workflow files
   - Check that database migrations are properly executed

3. **UI tests failing**:
   - Ensure Playwright browsers are properly installed
   - Check that the UI service is correctly started

4. **Performance test timeouts**:
   - Adjust timeout values in test configurations
   - Consider running performance tests in a separate job with more resources

### Debugging Tips

1. **Enable verbose logging**: Add `-v` or `--verbose` flags to test commands
2. **Upload artifacts**: Use `actions/upload-artifact` to save test results and logs
3. **Manual workflow triggering**: Use the GitHub Actions UI to manually trigger workflows for testing
4. **Check runner specifications**: Ubuntu runners have 2-core CPU and 7GB RAM by default

## Best Practices

1. **Fast feedback**: Keep the fast feedback workflow under 5 minutes
2. **Parallel execution**: Use matrix strategies and parallel jobs where possible
3. **Caching**: Utilize GitHub Actions caching for dependencies
4. **Selective testing**: Use path filtering to run only relevant tests
5. **Resource management**: Monitor resource usage and adjust accordingly
6. **Failure handling**: Design workflows to continue on non-critical failures
7. **Documentation**: Keep this README updated with any workflow changes