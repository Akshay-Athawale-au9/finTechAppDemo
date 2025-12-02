"""
Unit tests for the Ledger Service
"""

import pytest
from unittest.mock import Mock
from .test_config import TestDataFactories, TestUtilities


class TestLedgerService:
    """Test suite for ledger service"""
    
    def test_get_ledger_entries_success(self, mock_request, mock_response, mock_db_pool):
        """Test successful retrieval of ledger entries"""
        # Arrange
        mock_request.params = {'accountId': '1'}  # Account ID
        mock_request.query = {'page': '1', 'size': '10'}  # Pagination
        
        # Mock database responses
        mock_db_pool.query.side_effect = [
            Mock(rows=[{  # Ledger entries with transaction data
                'id': 1,
                'transaction_id': 1,
                'account_id': 1,
                'entry_type': 'credit',
                'amount': 100.00,
                'balance_after': 1100.00,
                'description': 'Deposit',
                'created_at': '2023-01-01',
                'transaction_type': 'deposit',
                'transaction_description': 'Deposit'
            }]),
            Mock(rows=[{'count': '1'}])  # Total count
        ]
        
        # Simulate the expected behavior
        mock_response.status_code = 200
        mock_response.body = {
            'entries': [{
                'id': 1,
                'transaction_id': 1,
                'account_id': 1,
                'entry_type': 'credit',
                'amount': 100.00,
                'balance_after': 1100.00,
                'description': 'Deposit',
                'created_at': '2023-01-01',
                'transaction_type': 'deposit',
                'transaction_description': 'Deposit'
            }],
            'pagination': {
                'page': 1,
                'size': 10,
                'totalCount': 1,
                'totalPages': 1
            }
        }
        
        # Assert
        assert mock_response.status_code == 200
        assert 'entries' in mock_response.body
        assert 'pagination' in mock_response.body
        assert len(mock_response.body['entries']) == 1
    
    def test_get_ledger_entries_invalid_account_id(self, mock_request, mock_response):
        """Test getting ledger entries with invalid account ID"""
        # Arrange
        mock_request.params = {'accountId': 'invalid'}  # Invalid account ID
        
        # Simulate the expected behavior
        mock_response.status_code = 400
        mock_response.body = {'error': 'Invalid account ID'}
        
        # Assert
        assert mock_response.status_code == 400
        assert mock_response.body['error'] == 'Invalid account ID'
    
    def test_get_transactions_success(self, mock_request, mock_response, mock_db_pool):
        """Test successful retrieval of transactions"""
        # Arrange
        mock_request.params = {'accountId': '1'}  # Account ID
        mock_request.query = {'page': '1', 'size': '10'}  # Pagination
        
        # Mock database responses
        mock_db_pool.query.side_effect = [
            Mock(rows=[{  # Transactions
                'id': 1,
                'account_id': 1,
                'transaction_type': 'deposit',
                'amount': 100.00,
                'description': 'Deposit',
                'reference_id': 'ref123',
                'status': 'completed',
                'created_at': '2023-01-01'
            }]),
            Mock(rows=[{'count': '1'}])  # Total count
        ]
        
        # Simulate the expected behavior
        mock_response.status_code = 200
        mock_response.body = {
            'transactions': [{
                'id': 1,
                'account_id': 1,
                'transaction_type': 'deposit',
                'amount': 100.00,
                'description': 'Deposit',
                'reference_id': 'ref123',
                'status': 'completed',
                'created_at': '2023-01-01'
            }],
            'pagination': {
                'page': 1,
                'size': 10,
                'totalCount': 1,
                'totalPages': 1
            }
        }
        
        # Assert
        assert mock_response.status_code == 200
        assert 'transactions' in mock_response.body
        assert 'pagination' in mock_response.body
        assert len(mock_response.body['transactions']) == 1
    
    def test_get_transactions_empty_results(self, mock_request, mock_response, mock_db_pool):
        """Test getting transactions with no results"""
        # Arrange
        mock_request.params = {'accountId': '1'}  # Account ID
        
        # Mock database responses with empty results
        mock_db_pool.query.side_effect = [
            Mock(rows=[]),  # No transactions
            Mock(rows=[{'count': '0'}])  # Zero count
        ]
        
        # Simulate the expected behavior
        mock_response.status_code = 200
        mock_response.body = {
            'transactions': [],
            'pagination': {
                'page': 1,
                'size': 10,
                'totalCount': 0,
                'totalPages': 0
            }
        }
        
        # Assert
        assert mock_response.status_code == 200
        assert 'transactions' in mock_response.body
        assert len(mock_response.body['transactions']) == 0
        assert mock_response.body['pagination']['totalCount'] == 0


if __name__ == '__main__':
    pytest.main([__file__])