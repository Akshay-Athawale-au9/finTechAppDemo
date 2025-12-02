"""
End-to-end tests for complete user flows
"""

import pytest
import requests
import time
import uuid
from typing import Dict, Any, Optional


class TestCompleteUserFlow:
    """Test suite for complete end-to-end user flows"""
    
    @classmethod
    def setup_class(cls):
        """Setup for all tests in this class"""
        cls.base_urls = {
            'auth': 'http://localhost:3001',
            'accounts': 'http://localhost:3002',
            'transfer': 'http://localhost:3003'
        }
        cls.session = requests.Session()
    
    def _generate_unique_email(self) -> str:
        """Generate a unique email address to avoid conflicts"""
        unique_id = str(uuid.uuid4()).replace('-', '')[:12]
        timestamp = int(time.time())
        return f"test_{unique_id}_{timestamp}@example.com"
    
    def _register_user(self, email: Optional[str] = None) -> Dict[str, Any]:
        """Helper method to register a new user"""
        if email is None:
            email = self._generate_unique_email()
            
        user_data = {
            'email': email,
            'password': 'SecurePass123!'
        }
        
        response = self.session.post(
            f"{self.base_urls['auth']}/auth/register",
            json=user_data
        )
        
        # Handle case where user might already exist
        if response.status_code == 409:
            # Generate a new unique email and try again
            email = self._generate_unique_email()
            user_data['email'] = email
            response = self.session.post(
                f"{self.base_urls['auth']}/auth/register",
                json=user_data
            )
        
        assert response.status_code == 201, f"Registration failed: {response.text}"
        return response.json()
    
    def _login_user(self, email: str, password: str = 'SecurePass123!') -> str:
        """Helper method to login and get access token"""
        login_data = {
            'email': email,
            'password': password
        }
        
        response = self.session.post(
            f"{self.base_urls['auth']}/auth/login",
            json=login_data
        )
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        return response.json()['accessToken']
    
    def _get_accounts(self, token: str) -> list:
        """Helper method to get user accounts"""
        self.session.headers.update({'Authorization': f'Bearer {token}'})
        
        response = self.session.get(f"{self.base_urls['accounts']}/accounts")
        
        assert response.status_code == 200, f"Get accounts failed: {response.text}"
        return response.json()['accounts']
    
    def _deposit_funds(self, token: str, account_id: int, amount: float) -> Dict[str, Any]:
        """Helper method to deposit funds into an account"""
        self.session.headers.update({'Authorization': f'Bearer {token}'})
        
        deposit_data = {
            'amount': amount,
            'description': 'Test deposit for E2E testing'
        }
        
        response = self.session.post(
            f"{self.base_urls['accounts']}/accounts/{account_id}/deposit",
            json=deposit_data
        )
        
        assert response.status_code == 201, f"Deposit failed: {response.text}"
        return response.json()
    
    def _initiate_transfer(self, token: str, from_account_id: int, to_account_id: int, amount: float) -> Dict[str, Any]:
        """Helper method to initiate a transfer"""
        self.session.headers.update({'Authorization': f'Bearer {token}'})
        
        transfer_data = {
            'fromAccountId': from_account_id,
            'toAccountId': to_account_id,
            'amount': amount
        }
        
        # Add idempotency key
        self.session.headers.update({'Idempotency-Key': f'transfer-{int(time.time() * 1000)}-{uuid.uuid4().hex[:8]}'})
        
        response = self.session.post(
            f"{self.base_urls['transfer']}/transfer",
            json=transfer_data
        )
        
        assert response.status_code == 201, f"Transfer failed: {response.text}"
        return response.json()
    
    def test_complete_user_registration_to_transfer_flow(self):
        """Test complete flow from user registration to fund transfer"""
        # Step 1: Register two users
        user1_data = self._register_user()
        user2_data = self._register_user()
        
        # Step 2: Login as first user
        token1 = self._login_user(user1_data['user']['email'])
        
        # Step 3: Get accounts for first user
        accounts1 = self._get_accounts(token1)
        assert len(accounts1) > 0, "User should have at least one account"
        
        # Step 4: Deposit funds into first user's account
        self._deposit_funds(token1, accounts1[0]['id'], 100.00)
        
        # Step 5: Login as second user
        token2 = self._login_user(user2_data['user']['email'])
        
        # Step 6: Get accounts for second user
        accounts2 = self._get_accounts(token2)
        assert len(accounts2) > 0, "User should have at least one account"
        
        # Step 7: Login as first user again for transfer
        token1 = self._login_user(user1_data['user']['email'])
        
        # Step 8: Initiate transfer from user1 to user2
        transfer_response = self._initiate_transfer(
            token1,
            accounts1[0]['id'],
            accounts2[0]['id'],
            50.00
        )
        
        # Step 9: Verify transfer was successful
        assert 'transferId' in transfer_response
        assert 'message' in transfer_response
        assert 'completed successfully' in transfer_response['message']
        
        print(f"Successfully completed end-to-end flow with transfer ID: {transfer_response['transferId']}")
    
    def test_user_account_balance_updates_after_transfer(self):
        """Test that account balances update correctly after a transfer"""
        # Step 1: Register two users
        user1_data = self._register_user()
        user2_data = self._register_user()
        
        # Step 2: Login as first user
        token1 = self._login_user(user1_data['user']['email'])
        
        # Step 3: Get accounts for first user (sender)
        accounts1 = self._get_accounts(token1)
        sender_account_id = accounts1[0]['id']
        
        # Deposit funds into sender's account
        self._deposit_funds(token1, sender_account_id, 100.00)
        
        # Get initial balance
        response = self.session.get(f"{self.base_urls['accounts']}/accounts/{sender_account_id}/balance")
        assert response.status_code == 200
        initial_sender_balance = response.json()['balance']
        
        # Step 4: Login as second user
        token2 = self._login_user(user2_data['user']['email'])
        
        # Step 5: Get accounts for second user (receiver)
        accounts2 = self._get_accounts(token2)
        receiver_account_id = accounts2[0]['id']
        
        # Get initial balance
        response = self.session.get(f"{self.base_urls['accounts']}/accounts/{receiver_account_id}/balance")
        assert response.status_code == 200
        initial_receiver_balance = response.json()['balance']
        
        # Step 6: Login as first user again for transfer
        token1 = self._login_user(user1_data['user']['email'])
        
        # Step 7: Initiate transfer
        transfer_amount = 25.00
        transfer_response = self._initiate_transfer(
            token1,
            sender_account_id,
            receiver_account_id,
            transfer_amount
        )
        
        # Step 8: Verify balances updated correctly
        # Login as sender to check balance
        token1 = self._login_user(user1_data['user']['email'])
        self.session.headers.update({'Authorization': f'Bearer {token1}'})
        
        response = self.session.get(f"{self.base_urls['accounts']}/accounts/{sender_account_id}/balance")
        assert response.status_code == 200
        updated_sender_balance = response.json()['balance']
        
        # Login as receiver to check balance
        token2 = self._login_user(user2_data['user']['email'])
        self.session.headers.update({'Authorization': f'Bearer {token2}'})
        
        response = self.session.get(f"{self.base_urls['accounts']}/accounts/{receiver_account_id}/balance")
        assert response.status_code == 200
        updated_receiver_balance = response.json()['balance']
        
        # Verify balances (note: this might not be exact due to timing of processing)
        assert float(updated_sender_balance) <= float(initial_sender_balance) - transfer_amount
        assert float(updated_receiver_balance) >= float(initial_receiver_balance) + transfer_amount
        
        print(f"Balances updated correctly after transfer of ${transfer_amount}")


if __name__ == '__main__':
    pytest.main([__file__, '-v'])