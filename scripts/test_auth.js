const http = require('http');

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123'
};

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            data: jsonData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    
    req.end();
  });
}

async function testAuthFlow() {
  console.log('Testing Auth Service...\n');

  try {
    // Test 1: Register a new user
    console.log('1. Registering new user...');
    const registerOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const registerResult = await makeRequest(registerOptions, testUser);
    console.log(`   Status: ${registerResult.statusCode}`);
    
    if (registerResult.statusCode === 201) {
      console.log('   ✅ User registered successfully');
    } else if (registerResult.statusCode === 409) {
      console.log('   ⚠️  User already exists (this is OK)');
    } else {
      console.log(`   ❌ Registration failed: ${JSON.stringify(registerResult.data)}`);
      return;
    }

    // Test 2: Login
    console.log('\n2. Logging in...');
    const loginOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const loginResult = await makeRequest(loginOptions, testUser);
    console.log(`   Status: ${loginResult.statusCode}`);
    
    if (loginResult.statusCode === 200) {
      console.log('   ✅ Login successful');
      console.log(`   Access Token: ${loginResult.data.accessToken ? loginResult.data.accessToken.substring(0, 20) + '...' : 'Not found'}`);
      console.log(`   Refresh Token: ${loginResult.data.refreshToken ? loginResult.data.refreshToken.substring(0, 20) + '...' : 'Not found'}`);
      
      // Test 3: Use access token to access accounts service
      console.log('\n3. Testing access to Accounts Service...');
      const accountsOptions = {
        hostname: 'localhost',
        port: 3002,
        path: '/accounts',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${loginResult.data.accessToken}`
        }
      };

      try {
        const accountsResult = await makeRequest(accountsOptions);
        console.log(`   Status: ${accountsResult.statusCode}`);
        if (accountsResult.statusCode === 200) {
          console.log('   ✅ Successfully accessed accounts service');
          if (accountsResult.data.accounts) {
            console.log(`   Found ${accountsResult.data.accounts.length} accounts`);
          }
        } else {
          console.log(`   ⚠️  Accounts service returned: ${JSON.stringify(accountsResult.data)}`);
        }
      } catch (err) {
        console.log(`   ❌ Error accessing accounts service: ${err.message}`);
      }
    } else {
      console.log(`   ❌ Login failed: ${JSON.stringify(loginResult.data)}`);
    }

    console.log('\n✅ Auth flow test completed!');
  } catch (err) {
    console.log(`❌ Error during test: ${err.message}`);
    console.log('💡 Make sure the services are running: cd infra && docker-compose up');
  }
}

testAuthFlow();