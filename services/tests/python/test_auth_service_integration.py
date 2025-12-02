import pytest
import requests
import time
from .test_config import TestConfig, TestDataFactories, TestUtilities


class TestAuthServiceIntegration:
    """Integration test suite for auth service"""
    
    @classmethod
    def setup_class(cls):
        """Setup for all tests in this class"""
        cls.base_url = "http://localhost:3001"  # Auth service port
        cls.session = requests.Session()
        
        # Wait a bit for service to start
        time.sleep(2)
    
    def test_register_new_user_success(self):
        """Test successful user registration with actual service"""
        # Arrange
        user_data = TestDataFactories.create_user(
            email=TestUtilities.generate_random_email()
        )
        
        # Act
        response = self.session.post(
            f"{self.base_url}/auth/register",
            json=user_data
        )
        
        # Assert
        assert response.status_code == 201
        data = response.json()
        assert 'user' in data
        assert 'account' in data
        assert data['user']['email'] == user_data['email']
    
    def test_register_duplicate_user(self):
        """Test registration with existing user"""
        # Arrange
        user_data = TestDataFactories.create_user(
            email=TestUtilities.generate_random_email()
        )
        
        # First registration
        self.session.post(
            f"{self.base_url}/auth/register",
            json=user_data
        )
        
        # Second registration (should fail)
        response = self.session.post(
            f"{self.base_url}/auth/register",
            json=user_data
        )
        
        # Assert
        assert response.status_code == 409
        data = response.json()
        assert data['error'] == 'User already exists'
    
    def test_login_success(self):
        """Test successful user login"""
        # Arrange
        user_data = TestDataFactories.create_user(
            email=TestUtilities.generate_random_email()
        )
        
        # Register user first
        reg_response = self.session.post(
            f"{self.base_url}/auth/register",
            json=user_data
        )
        assert reg_response.status_code == 201
        
        login_data = {
            'email': user_data['email'],
            'password': user_data['password']
        }
        
        # Act
        response = self.session.post(
            f"{self.base_url}/auth/login",
            json=login_data
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert 'accessToken' in data
        assert 'refreshToken' in data
        assert 'user' in data
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        # Arrange
        login_data = {
            'email': 'nonexistent@example.com',
            'password': 'wrongpassword'
        }
        
        # Act
        response = self.session.post(
            f"{self.base_url}/auth/login",
            json=login_data
        )
        
        # Assert
        assert response.status_code == 401
        data = response.json()
        assert data['error'] == 'Invalid credentials'


if __name__ == '__main__':
    pytest.main([__file__])