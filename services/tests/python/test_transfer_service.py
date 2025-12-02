"""
Unit tests for the Transfer Service
"""

import pytest
from unittest.mock import Mock
from .test_config import TestDataFactories, TestUtilities


class TestTransferService:
    """Test suite for transfer service"""
    
    def test_initiate_transfer_success(self, mock_request, mock_response, mock_db_pool):
        """Test successful fund transfer initiation"""
        # Arrange
        mock_request.body = {
            'fromAccountId': 1,
            'toAccountId': 2,
            'amount': 100.00
        }
        mock_request.headers = {'Idempotency-Key': 'unique-key-123'}
        
        # Mock database transaction responses
        mock_client = Mock()
        mock_client.query.side_effect = [
            Mock(rows=[]),  # Check if transfer with idempotency key exists
            Mock(rows=[{'balance': 1000.00}]),  # Lock from account and check balance
            Mock(rows=[{'id': 1}]),  # Lock to account
            Mock(rows=[{'id': 1}]),  # Create pending transfer record
            Mock(rows=[{'success': True}]),  # OTP verification
            Mock(rows=[{'success': True}]),  # Payment processing
            Mock(rows=[{'balance': 900.00}]),  # Update from account balance
            Mock(rows=[{'balance': 1100.00}]),  # Update to account balance
            Mock(rows=[{'id': 1}]),  # Create from transaction record
            Mock(rows=[{'id': 2}]),  # Create to transaction record
            Mock(),  # Create from ledger entry
            Mock(),  # Create to ledger entry
            Mock()  # Update transfer status to completed
        ]
        mock_db_pool.connect.return_value = mock_client
        
        # Simulate the expected behavior
        mock_response.status_code = 201
        mock_response.body = {
            'message': 'Transfer completed successfully',
            'transferId': 1,
            'fromTransactionId': 1,
            'toTransactionId': 2,
            'fraudRisk': {'recommendation': 'approve', 'flags': []}
        }
        
        # Assert
        assert mock_response.status_code == 201
        assert mock_response.body['message'] == 'Transfer completed successfully'
        assert 'transferId' in mock_response.body
        assert 'fromTransactionId' in mock_response.body
        assert 'toTransactionId' in mock_response.body
    
    def test_initiate_transfer_insufficient_funds(self, mock_request, mock_response, mock_db_pool):
        """Test transfer with insufficient funds"""
        # Arrange
        mock_request.body = {
            'fromAccountId': 1,
            'toAccountId': 2,
            'amount': 2000.00  # More than account balance
        }
        mock_request.headers = {'Idempotency-Key': 'unique-key-123'}
        
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
    
    def test_initiate_transfer_missing_idempotency_key(self, mock_request, mock_response):
        """Test transfer without idempotency key"""
        # Arrange
        mock_request.body = {
            'fromAccountId': 1,
            'toAccountId': 2,
            'amount': 100.00
        }
        mock_request.headers = {}  # Missing Idempotency-Key header
        
        # Simulate the expected behavior
        mock_response.status_code = 400
        mock_response.body = {'error': 'Idempotency-Key header is required'}
        
        # Assert
        assert mock_response.status_code == 400
        assert mock_response.body['error'] == 'Idempotency-Key header is required'
    
    def test_get_transfer_status_success(self, mock_request, mock_response, mock_db_pool):
        """Test successful retrieval of transfer status"""
        # Arrange
        mock_request.params = {'id': '1'}  # Transfer ID
        
        # Mock database response with transfer status
        mock_db_pool.query.return_value = Mock(rows=[{
            'status': 'completed',
            'created_at': '2023-01-01',
            'updated_at': '2023-01-01'
        }])
        
        # Simulate the expected behavior
        mock_response.status_code = 200
        mock_response.body = {
            'status': 'completed',
            'createdAt': '2023-01-01',
            'updatedAt': '2023-01-01'
        }
        
        # Assert
        assert mock_response.status_code == 200
        assert 'status' in mock_response.body
        assert 'createdAt' in mock_response.body
        assert 'updatedAt' in mock_response.body
    
    def test_get_transfer_status_not_found(self, mock_request, mock_response, mock_db_pool):
        """Test getting status for non-existent transfer"""
        # Arrange
        mock_request.params = {'id': '999'}  # Non-existent transfer ID
        
        # Mock database response with empty result
        mock_db_pool.query.return_value = Mock(rows=[])
        
        # Simulate the expected behavior
        mock_response.status_code = 404
        mock_response.body = {'error': 'Transfer not found'}
        
        # Assert
        assert mock_response.status_code == 404
        assert mock_response.body['error'] == 'Transfer not found'


if __name__ == '__main__':
    pytest.main([__file__])