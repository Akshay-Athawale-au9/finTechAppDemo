# Security Tests

This directory contains security tests for the fintech application.

## Directory Structure

```
security/
├── test_authentication_security.py  # Authentication security tests
├── test_authorization_security.py   # Authorization security tests
├── test_input_validation.py         # Input validation tests
└── requirements.txt                 # Security testing dependencies
```

## Prerequisites

1. Python 3.10+
2. All services must be running (via `docker-compose up`)
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Security Test Categories

### 1. Authentication Security Tests

Located in [test_authentication_security.py](file://d:\Interview\fintechApplciaitioon\services\tests\security\test_authentication_security.py)

#### Test Coverage
1. `test_jwt_token_expiration` - Validates JWT token expiration times
2. `test_password_strength_requirements` - Tests password strength enforcement
3. `test_brute_force_protection` - Verifies brute force attack protection
4. `test_sql_injection_in_auth_endpoints` - Tests SQL injection protection

### 2. Authorization Security Tests

Located in [test_authorization_security.py](file://d:\Interview\fintechApplciaitioon\services\tests\security\test_authorization_security.py)

#### Test Coverage
1. `test_access_without_token` - Ensures endpoints require authentication
2. `test_access_with_invalid_token` - Validates invalid token rejection
3. `test_cross_user_account_access` - Prevents users from accessing other users' data
4. `test_privilege_escalation` - Prevents privilege escalation attacks

### 3. Input Validation Tests

Located in [test_input_validation.py](file://d:\Interview\fintechApplciaitioon\services\tests\security\test_input_validation.py)

#### Test Coverage
1. `test_transfer_amount_validation` - Validates transfer amount inputs
2. `test_account_id_validation` - Validates account ID inputs
3. `test_json_payload_validation` - Tests JSON payload validation
4. `test_header_validation` - Validates HTTP header requirements

## Running Security Tests

```bash
cd d:\Interview\fintechApplciaitioon\services\tests\security
python -m pytest test_authentication_security.py test_authorization_security.py test_input_validation.py -v
```

## Additional Security Tools

### Bandit (Static Analysis)

Bandit is used for static analysis of Python code to identify common security issues.

```bash
bandit -r ../../services/
```

### Safety (Dependency Vulnerability Check)

Safety checks Python dependencies for known security vulnerabilities.

```bash
safety check
```

## Security Principles Tested

### Authentication Security
- JWT token expiration and validation
- Password strength requirements
- Brute force attack prevention
- SQL injection protection

### Authorization Security
- Token-based access control
- User isolation
- Privilege escalation prevention

### Input Validation
- Amount validation (positive, reasonable limits)
- ID validation (positive integers, existence)
- Payload size limits
- Malformed data handling

### Data Protection
- Sensitive data encryption (passwords)
- Secure token transmission
- Cross-user data isolation

## Test Data

Security tests use:
- Existing test users (user1@example.com, user2@example.com)
- Dynamically generated test users for registration tests
- Pre-populated accounts from seed data

## False Positives

Some tests may occasionally fail due to:
- Rate limiting triggering early
- Temporary service unavailability
- Clock synchronization issues with token expiration

Re-running tests usually resolves these issues.