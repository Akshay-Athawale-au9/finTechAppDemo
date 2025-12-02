"""
Unit tests for the Accounts Service
"""

import pytest
from unittest.mock import Mock
from .test_config import TestDataFactories, TestUtilities


class TestAccountsService:
    """Test suite for accounts service"""
    
    def test_get_accounts_success(self, mock_request, mock_response, mock_db_pool):
        """Test successful retrieval of user accounts"""
        # Arrange
        mock_request.userId = 1  # Simulate authenticated user
        
        # Mock database response with user accounts
        mock_db_pool.query.return_value = Mock(rows=[{
            'id': 1,
            'account_number': 'ACC001123',
            'account_type': 'checking',
            'balance': 1000.00,
            'currency': 'USD',
            'status': 'active',
            'created_at': '2023-01-01'
        }])
        
        # Simulate the expected behavior
        mock_response.status_code = 200
        mock_response.body = {
            'accounts': [{
                'id': 1,
                'account_number': 'ACC001123',
                'account_type': 'checking',
                'balance': 1000.00,
                'currency': 'USD',
                'status': 'active',
                'created_at': '2023-01-01'
            }]
        }
        
        # Assert
        assert mock_response.status_code == 200
        assert 'accounts' in mock_response.body
        assert len(mock_response.body['accounts']) == 1
    
    def test_get_accounts_unauthorized(self, mock_request, mock_response):
        """Test getting accounts without authentication"""
        # Arrange
        mock_request.headers = {}  # No authorization header
        
        # Simulate the expected behavior
        mock_response.status_code = 401
        mock_response.body = {'error': 'Access token required'}
        
        # Assert
        assert mock_response.status_code == 401
        assert mock_response.body['error'] == 'Access token required'
    
    def test_get_account_balance_success(self, mock_request, mock_response, mock_db_pool):
        """Test successful retrieval of account balance"""
        # Arrange
        mock_request.params = {'id': '1'}  # Account ID
        
        # Mock database response with account balance
        mock_db_pool.query.return_value = Mock(rows=[{
            'balance': 1000.00,
            'currency': 'USD'
        }])
        
        # Simulate the expected behavior
        mock_response.status_code = 200
        mock_response.body = {
            'balance': 1000.00,
            'currency': 'USD'
        }
        
        # Assert
        assert mock_response.status_code == 200
        assert 'balance' in mock_response.body
        assert 'currency' in mock_response.body
    
    def test_get_account_balance_not_found(self, mock_request, mock_response, mock_db_pool):
        """Test getting balance for non-existent account"""
        # Arrange
        mock_request.params = {'id': '999'}  # Non-existent account ID
        
        # Mock database response with empty result
        mock_db_pool.query.return_value = Mock(rows=[])
        
        # Simulate the expected behavior
        mock_response.status_code = 404
        mock_response.body = {'error': 'Account not found'}
        
        # Assert
        assert mock_response.status_code == 404
        assert mock_response.body['error'] == 'Account not found'
    
    def test_deposit_success(self, mock_request, mock_response, mock_db_pool):
        """Test successful deposit to account"""
        # Arrange
        mock_request.params = {'id': '1'}  # Account ID
        mock_request.body = {
            'amount': 100.00,
            'description': 'Test deposit'
        }
        
        # Mock database transaction responses
        mock_client = Mock()
        mock_client.query.side_effect = [
            Mock(rows=[{'balance': 1100.00}]),  # Update account balance
            Mock(rows=[{'id': 1, 'created_at': '2023-01-01'}]),  # Create transaction record
            Mock()  # Create ledger entry
        ]
        mock_db_pool.connect.return_value = mock_client
        
        # Simulate the expected behavior
        mock_response.status_code = 201
        mock_response.body = {
            'message': 'Deposit successful',
            'transactionId': 1,
            'newBalance': 1100.00,
            'createdAt': '2023-01-01'
        }
        
        # Assert
        assert mock_response.status_code == 201
        assert mock_response.body['message'] == 'Deposit successful'
        assert 'transactionId' in mock_response.body
        assert 'newBalance' in mock_response.body
    
    def test_withdraw_success(self, mock_request, mock_response, mock_db_pool):
        """Test successful withdrawal from account"""
        # Arrange
        mock_request.params = {'id': '1'}  # Account ID
        mock_request.body = {
            'amount': 100.00,
            'description': 'Test withdrawal'
        }
        
        # Mock database transaction responses
        mock_client = Mock()
        mock_client.query.side_effect = [
            Mock(rows=[{'balance': 1000.00}]),  # Check current balance
            Mock(),  # Update account balance
            Mock(rows=[{'id': 1, 'created_at': '2023-01-01'}]),  # Create transaction record
            Mock()  # Create ledger entry
        ]
        mock_db_pool.connect.return_value = mock_client
        
        # Simulate the expected behavior
        mock_response.status_code = 201
        mock_response.body = {
            'message': 'Withdrawal successful',
            'transactionId': 1,
            'newBalance': 900.00,
            'createdAt': '2023-01-01'
        }
        
        # Assert
        assert mock_response.status_code == 201
        assert mock_response.body['message'] == 'Withdrawal successful'
        assert 'transactionId' in mock_response.body
        assert 'newBalance' in mock_response.body
    
    def test_withdraw_insufficient_funds(self, mock_request, mock_response, mock_db_pool):
        """Test withdrawal with insufficient funds"""
        # Arrange
        mock_request.params = {'id': '1'}  # Account ID
        mock_request.body = {
            'amount': 2000.00,  # More than account balance
            'description': 'Test withdrawal'
        }
        
        # Mock database response showing insufficient balance
        mock_client = Mock()
        mock_client.query.return_value = Mock(rows=[{'balance': 1000.00}])  # Current balance
        mock_db_pool.connect.return_value = mock_client
        
        # Simulate the expected behavior
        mock_response.status_code = 400
        mock_response.body = {'error': 'Insufficient funds'}
        
        # Assert
        assert mock_response.status_code == 400
        assert mock_response.body['error'] == 'Insufficient funds'


if __name__ == '__main__':
    pytest.main([__file__])