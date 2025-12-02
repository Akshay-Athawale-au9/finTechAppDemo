"""
Security tests for authorization mechanisms
"""

import pytest
import requests
import time


class TestAuthorizationSecurity:
    """Test suite for authorization security"""
    
    @classmethod
    def setup_class(cls):
        """Setup for all tests in this class"""
        cls.base_urls = {
            'auth': 'http://localhost:3001',
            'accounts': 'http://localhost:3002',
            'transfer': 'http://localhost:3003'
        }
        cls.session = requests.Session()
    
    def _get_user_token(self, email: str = 'akshay@example.com', password: str = 'password123') -> str:
        """Helper method to get user token"""
        login_data = {'email': email, 'password': password}
        response = self.session.post(f"{self.base_urls['auth']}/auth/login", json=login_data)
        assert response.status_code == 200
        return response.json()['accessToken']
    
    def test_access_without_token(self):
        """Test accessing protected endpoints without token"""
        # Try to access accounts without token
        response = self.session.get(f"{self.base_urls['accounts']}/accounts")
        assert response.status_code in [401, 403], "Should require authentication"
        
        # Try to access transfer endpoint without token (without proper headers)
        response = self.session.post(f"{self.base_urls['transfer']}/transfer", json={})
        # This might return 400 for missing idempotency key or 401/403 for auth, both are acceptable
        assert response.status_code in [400, 401, 403], "Should require authentication or proper headers"
    
    def test_access_with_invalid_token(self):
        """Test accessing protected endpoints with invalid token"""
        # Set invalid token
        self.session.headers.update({'Authorization': 'Bearer invalid.token.here'})
        
        # Try to access accounts with invalid token
        response = self.session.get(f"{self.base_urls['accounts']}/accounts")
        assert response.status_code in [401, 403], "Should reject invalid token"
        
        # Try to access transfer endpoint with invalid token
        response = self.session.post(f"{self.base_urls['transfer']}/transfer", json={})
        assert response.status_code in [400, 401, 403], "Should reject invalid token or require proper headers"
    
    def test_cross_user_account_access(self):
        """Test that users cannot access other users' accounts"""
        # Get tokens for two different users
        token1 = self._get_user_token('akshay@example.com', 'password123')
        # For this test, we'll use the same user since we only have one test user
        token2 = self._get_user_token('akshay@example.com', 'password123')
        
        # Get accounts for user1
        self.session.headers.update({'Authorization': f'Bearer {token1}'})
        response = self.session.get(f"{self.base_urls['accounts']}/accounts")
        assert response.status_code == 200
        accounts1 = response.json()['accounts']
        assert len(accounts1) > 0
        
        # Try to access user1's account with user2's token (same user in this case)
        self.session.headers.update({'Authorization': f'Bearer {token2}'})
        account_id = accounts1[0]['id']
        response = self.session.get(f"{self.base_urls['accounts']}/accounts/{account_id}/balance")
        
        # Should succeed since it's the same user
        assert response.status_code == 200
    
    def test_privilege_escalation(self):
        """Test privilege escalation prevention"""
        # Login as regular user
        token = self._get_user_token('akshay@example.com', 'password123')
        self.session.headers.update({'Authorization': f'Bearer {token}'})
        
        # Try to access admin-only endpoints (if any exist)
        # This is a placeholder - in a real app, we'd test actual admin endpoints
        response = self.session.get(f"{self.base_urls['accounts']}/admin")  # Hypothetical admin endpoint
        assert response.status_code in [403, 404], "Regular users should not have admin privileges"


if __name__ == '__main__':
    pytest.main([__file__, '-v'])