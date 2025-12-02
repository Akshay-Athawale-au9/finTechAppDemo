"""
pytest configuration and fixtures for fintech microservices tests
"""

import pytest
import os
import sys
from unittest.mock import Mock, patch

# Add the services directories to the path so we can import the modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'auth', 'src'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'accounts', 'src'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'transfer', 'src'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'ledger', 'src'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'consumer', 'src'))

@pytest.fixture
def mock_request():
    """Create a mock HTTP request object"""
    request = Mock()
    request.body = {}
    request.params = {}
    request.query = {}
    request.headers = {}
    return request

@pytest.fixture
def mock_response():
    """Create a mock HTTP response object"""
    response = Mock()
    response.status_code = 200
    response.body = {}
    return response

@pytest.fixture
def mock_db_pool():
    """Create a mock database pool"""
    pool = Mock()
    pool.query = Mock()
    pool.connect = Mock()
    return pool

@pytest.fixture
def test_data():
    """Provide test data for all services"""
    return {
        'user': {
            'id': 1,
            'email': 'test@example.com',
            'password': 'StrongPass123!',
            'roles': ['user']
        },
        'account': {
            'id': 1,
            'user_id': 1,
            'account_number': 'ACC001123',
            'account_type': 'checking',
            'balance': 1000.00,
            'currency': 'USD',
            'status': 'active'
        },
        'transaction': {
            'id': 1,
            'from_account_id': 1,
            'to_account_id': 2,
            'amount': 100.00,
            'currency': 'USD',
            'status': 'pending'
        }
    }