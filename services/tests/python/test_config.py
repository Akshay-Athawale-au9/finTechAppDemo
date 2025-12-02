"""
Test configuration for fintech microservices
"""

class TestConfig:
    """Test environment configuration"""
    
    # Database configuration for tests
    DATABASE = {
        'host': 'localhost',
        'port': 5432,
        'name': 'fintech_test',
        'user': 'test_user',
        'password': 'test_password'
    }
    
    # Redis configuration for tests
    REDIS = {
        'host': 'localhost',
        'port': 6379
    }
    
    # Kafka configuration for tests
    KAFKA = {
        'brokers': ['localhost:9092']
    }
    
    # JWT secrets for tests
    JWT = {
        'secret': 'test_jwt_secret',
        'refresh_secret': 'test_refresh_secret'
    }
    
    # Test timeouts
    TIMEOUTS = {
        'short': 5,    # 5 seconds
        'medium': 15,  # 15 seconds
        'long': 30     # 30 seconds
    }


class TestDataFactories:
    """Test data factories"""
    
    @staticmethod
    def create_user(**overrides):
        """Create a test user"""
        user = {
            'email': 'test@example.com',
            'password': 'StrongPass123!',
            'roles': ['user']
        }
        user.update(overrides)
        return user
    
    @staticmethod
    def create_account(**overrides):
        """Create a test account"""
        account = {
            'account_number': 'ACC001123',
            'account_type': 'checking',
            'balance': 1000.00,
            'currency': 'USD',
            'status': 'active'
        }
        account.update(overrides)
        return account
    
    @staticmethod
    def create_transaction(**overrides):
        """Create a test transaction"""
        transaction = {
            'amount': 100.00,
            'type': 'transfer',
            'description': 'Test transfer',
            'status': 'completed'
        }
        transaction.update(overrides)
        return transaction


class TestUtilities:
    """Test utility functions"""
    
    @staticmethod
    def generate_random_email():
        """Generate a random email for testing"""
        import random
        import string
        random_string = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
        return f'test_{random_string}@example.com'
    
    @staticmethod
    def generate_account_number():
        """Generate a random account number"""
        import random
        return f'ACC{random.randint(100000, 999999)}'
    
    class MockExternalServices:
        """Mock external services"""
        
        class OTPVerification:
            @staticmethod
            def success():
                return {'success': True}
            
            @staticmethod
            def failure():
                return {'success': False, 'error': 'Invalid OTP'}
        
        class PaymentProcessing:
            @staticmethod
            def success():
                return {'success': True, 'transactionId': 'txn_123'}
            
            @staticmethod
            def failure():
                return {'success': False, 'error': 'Payment failed'}
        
        class FraudDetection:
            @staticmethod
            def approve():
                return {'recommendation': 'approve', 'flags': []}
            
            @staticmethod
            def review():
                return {'recommendation': 'review', 'flags': ['high_amount']}
            
            @staticmethod
            def reject():
                return {'recommendation': 'reject', 'flags': ['suspicious_activity']}


# Test coverage targets
TEST_COVERAGE_TARGETS = {
    'statements': 80,
    'branches': 80,
    'functions': 80,
    'lines': 80
}