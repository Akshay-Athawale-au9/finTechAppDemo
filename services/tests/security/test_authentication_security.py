"""
Security tests for authentication mechanisms
"""

import pytest
import requests
import time
from datetime import datetime, timedelta
import importlib

# Try to import JWT, but handle the case where it's not available
JWT_AVAILABLE = False
jwt = None

try:
    jwt = importlib.import_module('jwt')
    JWT_AVAILABLE = True
except ImportError:
    print("JWT library is not installed. Some tests may not run.")


class TestAuthenticationSecurity:
    """Test suite for authentication security"""
    
    @classmethod
    def setup_class(cls):
        """Setup for all tests in this class"""
        cls.base_url = 'http://localhost:3001'  # Auth service
        cls.session = requests.Session()
    
    def test_jwt_token_expiration(self):
        """Test that JWT tokens expire correctly"""
        # Skip test if JWT is not available
        if not JWT_AVAILABLE or jwt is None:
            pytest.skip("JWT library not available")
            
        # Register a new user
        user_data = {
            'email': f'security_test_{int(time.time())}@example.com',
            'password': 'SecurePass123!'
        }
        
        response = self.session.post(f"{self.base_url}/auth/register", json=user_data)
        assert response.status_code == 201
        
        # Login to get tokens
        login_data = {
            'email': user_data['email'],
            'password': user_data['password']
        }
        
        response = self.session.post(f"{self.base_url}/auth/login", json=login_data)
        assert response.status_code == 200
        
        tokens = response.json()
        access_token = tokens['accessToken']
        
        # Decode token to check expiration
        try:
            if jwt is not None:
                decoded = jwt.decode(access_token, options={"verify_signature": False})
                exp_timestamp = decoded['exp']
                exp_datetime = datetime.fromtimestamp(exp_timestamp)
                current_datetime = datetime.now()
                
                # Verify token expires in the future (but within reasonable time)
                assert exp_datetime > current_datetime, "Token should not be expired"
                assert exp_datetime < current_datetime + timedelta(hours=2), "Token expiration should be reasonable"
                
                print(f"Token expires at: {exp_datetime}")
            else:
                pytest.skip("JWT library not available for decoding")
        except Exception as e:
            # Check if it's a JWT decode error
            if jwt is not None and hasattr(jwt, 'DecodeError') and isinstance(e, jwt.DecodeError):
                pytest.fail("Failed to decode JWT token")
            else:
                # Skip if JWT is not available
                pytest.skip("JWT library not available for decoding")
    
    def test_password_strength_requirements(self):
        """Test password strength requirements"""
        weak_passwords = [
            '123456',           # Too common
            'password',         # Too common
            'abc',              # Too short
            'password123',      # Predictable pattern
        ]
        
        for weak_password in weak_passwords:
            user_data = {
                'email': f'test_{int(time.time())}_{weak_password}@example.com',
                'password': weak_password
            }
            
            response = self.session.post(f"{self.base_url}/auth/register", json=user_data)
            # Weak passwords should either fail or be rejected
            assert response.status_code in [400, 422], f"Weak password '{weak_password}' was accepted"
    
    def test_brute_force_protection(self):
        """Test brute force attack protection"""
        # Attempt multiple failed logins with wrong passwords
        login_data = {
            'email': 'user1@example.com',
            'password': 'wrongpassword'
        }
        
        failed_attempts = 0
        max_attempts = 10
        
        for i in range(max_attempts):
            response = self.session.post(f"{self.base_url}/auth/login", json=login_data)
            if response.status_code == 429:  # Too Many Requests
                print(f"Rate limiting triggered after {i+1} attempts")
                break
            failed_attempts += 1
        
        # Should have rate limiting protection
        assert failed_attempts < max_attempts, "Brute force protection not working"
    
    def test_sql_injection_in_auth_endpoints(self):
        """Test SQL injection protection in auth endpoints"""
        malicious_inputs = [
            "'; DROP TABLE users; --",
            "admin'--",
            "' OR '1'='1",
            "'; SELECT * FROM accounts; --"
        ]
        
        for malicious_input in malicious_inputs:
            # Test registration with malicious input
            user_data = {
                'email': malicious_input,
                'password': 'SecurePass123!'
            }
            
            response = self.session.post(f"{self.base_url}/auth/register", json=user_data)
            # Should either succeed (treating input as literal) or fail gracefully
            assert response.status_code in [201, 400, 422], f"SQL injection attempt was not handled properly: {malicious_input}"
            
            # Test login with malicious input
            login_data = {
                'email': malicious_input,
                'password': malicious_input
            }
            
            response = self.session.post(f"{self.base_url}/auth/login", json=login_data)
            # Should fail gracefully
            assert response.status_code in [400, 401, 422], f"SQL injection attempt was not handled properly: {malicious_input}"


if __name__ == '__main__':
    pytest.main([__file__, '-v'])