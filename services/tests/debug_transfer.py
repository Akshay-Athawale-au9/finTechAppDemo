import requests
import time
import uuid

# Create a session
s = requests.Session()

# Register a user
email = f'user_test_{int(time.time())}@example.com'
reg_resp = s.post('http://localhost:3001/auth/register', json={'email': email, 'password': 'SecurePass123!'})
print('Register:', reg_resp.status_code)

# Login
login_resp = s.post('http://localhost:3001/auth/login', json={'email': email, 'password': 'SecurePass123!'})
token = login_resp.json()['accessToken']
print('Login:', login_resp.status_code)

# Get accounts
s.headers.update({'Authorization': f'Bearer {token}'})
acc_resp = s.get('http://localhost:3002/accounts')
print('Accounts:', acc_resp.status_code)
accounts = acc_resp.json()['accounts']
print('Account ID:', accounts[0]['id'])

# Deposit funds
deposit_data = {'amount': 100.00, 'description': 'Test'}
dep_resp = s.post(f'http://localhost:3002/accounts/{accounts[0]["id"]}/deposit', json=deposit_data)
print('Deposit:', dep_resp.status_code)
print('Deposit response:', dep_resp.json())

# Transfer funds (to same account for testing)
transfer_data = {
    'fromAccountId': accounts[0]['id'],
    'toAccountId': accounts[0]['id'],
    'amount': 10.00
}
s.headers.update({'Idempotency-Key': f'test-{int(time.time() * 1000)}-{uuid.uuid4().hex[:8]}'})
trans_resp = s.post('http://localhost:3003/transfer', json=transfer_data)
print('Transfer:', trans_resp.status_code)
print('Transfer response:', trans_resp.json())