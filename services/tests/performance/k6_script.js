import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Custom metrics
const loginTrend = new Trend('login_duration');
const accountsTrend = new Trend('accounts_duration');
const transferTrend = new Trend('transfer_duration');
const errorRate = new Rate('errors');

// Test options
export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up to 10 users over 30 seconds
    { duration: '1m', target: 10 },  // Stay at 10 users for 1 minute
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    errors: ['rate<0.1'], // Error rate should be less than 10%
  },
};

// Test data
const BASE_URLS = {
  auth: 'http://localhost:3001',
  accounts: 'http://localhost:3002',
  transfer: 'http://localhost:3003',
};

const TEST_USER = {
  email: 'akshay@example.com',
  password: 'password123',
};

let authToken = '';

// Setup function to authenticate and get token
export function setup() {
  const loginPayload = JSON.stringify(TEST_USER);
  const loginHeaders = { 'Content-Type': 'application/json' };
  
  const loginResponse = http.post(`${BASE_URLS.auth}/auth/login`, loginPayload, { headers: loginHeaders });
  
  if (loginResponse.status === 200) {
    const responseData = JSON.parse(loginResponse.body);
    return { token: responseData.accessToken };
  } else {
    console.error('Setup failed: Unable to authenticate test user');
    return { token: null };
  }
}

// Main test function for virtual users
export default function (data) {
  // Check if setup was successful
  if (!data || !data.token) {
    errorRate.add(1);
    return;
  }
  
  authToken = data.token;
  const authHeaders = { 
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json',
  };

  // Test 1: Get user accounts
  const accountsStart = new Date().getTime();
  const accountsResponse = http.get(`${BASE_URLS.accounts}/accounts`, { headers: authHeaders });
  const accountsEnd = new Date().getTime();
  accountsTrend.add(accountsEnd - accountsStart);
  
  check(accountsResponse, {
    'accounts status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  // Test 2: Get account balance (using first account if available)
  if (accountsResponse.status === 200) {
    try {
      const accountsData = JSON.parse(accountsResponse.body);
      if (accountsData.accounts && accountsData.accounts.length > 0) {
        const accountId = accountsData.accounts[0].id;
        const balanceResponse = http.get(`${BASE_URLS.accounts}/accounts/${accountId}/balance`, { headers: authHeaders });
        check(balanceResponse, {
          'balance status is 200': (r) => r.status === 200,
        }) || errorRate.add(1);
      }
    } catch (e) {
      errorRate.add(1);
    }
  }

  // Test 3: Simulate transfer (without actually transferring)
  const transferPayload = JSON.stringify({
    fromAccountId: 1,
    toAccountId: 2,
    amount: 10.00,
  });
  
  const transferHeaders = {
    ...authHeaders,
    'Idempotency-Key': `k6-transfer-${Date.now()}-${Math.random()}`,
  };
  
  const transferStart = new Date().getTime();
  const transferResponse = http.post(`${BASE_URLS.transfer}/transfer`, transferPayload, { headers: transferHeaders });
  const transferEnd = new Date().getTime();
  transferTrend.add(transferEnd - transferStart);
  
  check(transferResponse, {
    'transfer status is 201 or 400': (r) => r.status === 201 || r.status === 400,
  }) || errorRate.add(1);

  // Simulate user think time
  sleep(1);
}

// Teardown function (optional)
export function teardown(data) {
  // Cleanup if needed
  console.log('Performance test completed');
}