import pytest
import requests
import time
from .test_config import TestConfig, TestDataFactories, TestUtilities


class TestAccountsServiceIntegration:
    """Integration test suite for accounts service"""
    
    @classmethod
    def setup_class(cls):
        """Setup for all tests in this class"""
        cls.base_url = "http://localhost:3002"  # Accounts service port
        cls.auth_base_url = "http://localhost:3001"  # Auth service port
        cls.session = requests.Session()
        
        # Wait a bit for services to start
        time.sleep(2)
    
    def _get_auth_token(self):
        """Helper method to get an auth token"""
        # Register a new user
        user_data = TestDataFactories.create_user(
            email=TestUtilities.generate_random_email()
        )
        
        reg_response = self.session.post(
            f"{self.auth_base_url}/auth/register",
            json=user_data
        )
        
        if reg_response.status_code != 201:
            raise Exception(f"Failed to register user: {reg_response.text}")
        
        # Login to get token
        login_data = {
            'email': user_data['email'],
            'password': user_data['password']
        }
        
        login_response = self.session.post(
            f"{self.auth_base_url}/auth/login",
            json=login_data
        )
        
        if login_response.status_code != 200:
            raise Exception(f"Failed to login: {login_response.text}")
        
        return login_response.json()['accessToken']
    
    def test_get_accounts_success(self):
        """Test successful retrieval of user accounts"""
        # Arrange
        token = self._get_auth_token()
        self.session.headers.update({'Authorization': f'Bearer {token}'})
        
        # Act
        response = self.session.get(f"{self.base_url}/accounts")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert 'accounts' in data
        assert isinstance(data['accounts'], list)
    
    def test_get_accounts_unauthorized(self):
        """Test getting accounts without authentication"""
        # Arrange
        self.session.headers.pop('Authorization', None)
        
        # Act
        response = self.session.get(f"{self.base_url}/accounts")
        
        # Assert
        assert response.status_code == 401
        data = response.json()
        assert 'error' in data
    
    def test_get_account_balance_success(self):
        """Test successful retrieval of account balance"""
        # Arrange
        token = self._get_auth_token()
        self.session.headers.update({'Authorization': f'Bearer {token}'})
        
        # First get accounts to get an account ID
        accounts_response = self.session.get(f"{self.base_url}/accounts")
        assert accounts_response.status_code == 200
        accounts = accounts_response.json()['accounts']
        assert len(accounts) > 0
        account_id = accounts[0]['id']
        
        # Act
        response = self.session.get(f"{self.base_url}/accounts/{account_id}/balance")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert 'balance' in data
        assert 'currency' in data
    
    def test_deposit_funds_success(self):
        """Test successful deposit to account"""
        # Arrange
        token = self._get_auth_token()
        self.session.headers.update({'Authorization': f'Bearer {token}'})
        
        # Get an account ID
        accounts_response = self.session.get(f"{self.base_url}/accounts")
        assert accounts_response.status_code == 200
        accounts = accounts_response.json()['accounts']
        assert len(accounts) > 0
        account_id = accounts[0]['id']
        
        deposit_data = {
            'amount': 100.00,
            'description': 'Test deposit'
        }
        
        # Act
        response = self.session.post(
            f"{self.base_url}/accounts/{account_id}/deposit",
            json=deposit_data
        )
        
        # Assert
        assert response.status_code == 201
        data = response.json()
        assert 'message' in data
        assert 'transactionId' in data
        assert 'newBalance' in data


if __name__ == '__main__':
    pytest.main([__file__])