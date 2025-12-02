"""
Security tests for input validation
"""

import pytest
import requests
import time


class TestInputValidationSecurity:
    """Test suite for input validation security"""
    
    @classmethod
    def setup_class(cls):
        """Setup for all tests in this class"""
        cls.base_urls = {
            'auth': 'http://localhost:3001',
            'accounts': 'http://localhost:3002',
            'transfer': 'http://localhost:3003'
        }
        cls.session = requests.Session()
    
    def _get_user_token(self) -> str:
        """Helper method to get user token"""
        login_data = {'email': 'akshay@example.com', 'password': 'password123'}
        response = self.session.post(f"{self.base_urls['auth']}/auth/login", json=login_data)
        assert response.status_code == 200
        return response.json()['accessToken']
    
    def test_transfer_amount_validation(self):
        """Test transfer amount validation"""
        token = self._get_user_token()
        self.session.headers.update({'Authorization': f'Bearer {token}'})
        
        # Test negative amounts
        transfer_data = {
            'fromAccountId': 1,
            'toAccountId': 2,
            'amount': -50.00
        }
        
        self.session.headers.update({'Idempotency-Key': f'test-{int(time.time())}'})
        response = self.session.post(f"{self.base_urls['transfer']}/transfer", json=transfer_data)
        assert response.status_code == 400, "Negative amounts should be rejected"
        
        # Test zero amounts
        transfer_data['amount'] = 0.00
        response = self.session.post(f"{self.base_urls['transfer']}/transfer", json=transfer_data)
        assert response.status_code == 400, "Zero amounts should be rejected"
        
        # Test excessive amounts
        transfer_data['amount'] = 1000000000.00  # 1 billion
        response = self.session.post(f"{self.base_urls['transfer']}/transfer", json=transfer_data)
        # Could be rejected for business logic reasons or due to validation
        assert response.status_code in [400, 422], "Excessive amounts should be rejected"
    
    def test_account_id_validation(self):
        """Test account ID validation"""
        token = self._get_user_token()
        self.session.headers.update({'Authorization': f'Bearer {token}'})
        
        # Test invalid account IDs
        invalid_ids = [-1, 0, 'abc', None, '', 999999]
        
        for invalid_id in invalid_ids:
            # Test in balance endpoint
            response = self.session.get(f"{self.base_urls['accounts']}/accounts/{invalid_id}/balance")
            assert response.status_code in [400, 404, 422], f"Invalid account ID {invalid_id} should be rejected"
            
            # Test in deposit endpoint
            deposit_data = {'amount': 100.00, 'description': 'Test deposit'}
            response = self.session.post(f"{self.base_urls['accounts']}/accounts/{invalid_id}/deposit", json=deposit_data)
            assert response.status_code in [400, 404, 422], f"Invalid account ID {invalid_id} should be rejected"
    
    def test_json_payload_validation(self):
        """Test JSON payload validation"""
        token = self._get_user_token()
        self.session.headers.update({'Authorization': f'Bearer {token}'})
        
        # Test malformed JSON
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
            'Idempotency-Key': f'test-{int(time.time())}'
        }
        
        malformed_json = '{"fromAccountId": 1, "toAccountId": 2, "amount":}'  # Invalid JSON
        response = self.session.post(
            f"{self.base_urls['transfer']}/transfer",
            data=malformed_json,
            headers=headers
        )
        assert response.status_code == 400, "Malformed JSON should be rejected"
        
        # Test excessively large payloads
        large_payload = {
            'fromAccountId': 1,
            'toAccountId': 2,
            'amount': 50.00,
            'description': 'A' * 10000  # Very large description
        }
        
        response = self.session.post(f"{self.base_urls['transfer']}/transfer", json=large_payload, headers=headers)
        # Should either succeed (truncating large fields) or reject for size
        assert response.status_code in [201, 400, 413], "Excessively large payloads should be handled appropriately"
    
    def test_header_validation(self):
        """Test HTTP header validation"""
        token = self._get_user_token()
        
        # Test missing idempotency key for transfer
        headers = {'Authorization': f'Bearer {token}'}
        transfer_data = {
            'fromAccountId': 1,
            'toAccountId': 2,
            'amount': 50.00
        }
        
        response = self.session.post(f"{self.base_urls['transfer']}/transfer", json=transfer_data, headers=headers)
        assert response.status_code == 400, "Idempotency key should be required for transfers"
        
        # Test duplicate idempotency key handling
        idempotency_key = f'duplicate-test-{int(time.time())}'
        headers['Idempotency-Key'] = idempotency_key
        
        # First request
        response1 = self.session.post(f"{self.base_urls['transfer']}/transfer", json=transfer_data, headers=headers)
        
        # Second request with same key (should return same result)
        response2 = self.session.post(f"{self.base_urls['transfer']}/transfer", json=transfer_data, headers=headers)
        
        # Both should succeed with same transfer ID
        if response1.status_code == 201 and response2.status_code == 201:
            assert response1.json()['transferId'] == response2.json()['transferId'], "Duplicate idempotency keys should return same result"


if __name__ == '__main__':
    pytest.main([__file__, '-v'])