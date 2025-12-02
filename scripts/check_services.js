const http = require('http');

// Service endpoints to check
const services = [
  { name: 'Auth Service', url: 'http://localhost:3001/health', port: 3001 },
  { name: 'Accounts Service', url: 'http://localhost:3002/health', port: 3002 },
  { name: 'Transfer Service', url: 'http://localhost:3003/health', port: 3003 },
  { name: 'Ledger Service', url: 'http://localhost:3004/health', port: 3004 }
];

async function checkService(service) {
  return new Promise((resolve) => {
    const url = new URL(service.url);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            name: service.name,
            status: res.statusCode === 200 ? '✅ UP' : `⚠️  ${res.statusCode}`,
            details: jsonData
          });
        } catch (e) {
          resolve({
            name: service.name,
            status: res.statusCode === 200 ? '✅ UP' : `⚠️  ${res.statusCode}`,
            details: data
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        name: service.name,
        status: '❌ DOWN',
        details: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: service.name,
        status: '❌ TIMEOUT',
        details: 'Request timed out'
      });
    });

    req.end();
  });
}

function checkPort(port) {
  return new Promise((resolve) => {
    const socket = new require('net').Socket();
    socket.setTimeout(1000);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('error', () => {
      resolve(false);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.connect(port, '127.0.0.1');
  });
}

async function checkAllServices() {
  console.log('Checking service status...\n');

  for (const service of services) {
    try {
      // First check if port is open
      const portOpen = await checkPort(service.port);
      if (!portOpen) {
        console.log(`${service.name}: ❌ PORT ${service.port} CLOSED`);
        console.log('  The service might still be starting up or has encountered an error.\n');
        continue;
      }
      
      // If port is open, check the health endpoint
      const result = await checkService(service);
      console.log(`${result.name}: ${result.status}`);
      
      if (result.details) {
        if (typeof result.details === 'object') {
          if (result.details.status) {
            console.log(`  Status: ${result.details.status}`);
          }
          if (result.details.timestamp) {
            console.log(`  Timestamp: ${result.details.timestamp}`);
          }
          if (result.details.services) {
            console.log('  Services:');
            for (const [key, value] of Object.entries(result.details.services)) {
              console.log(`    ${key}: ${value}`);
            }
          }
        } else {
          console.log(`  Details: ${result.details.substring(0, 100)}${result.details.length > 100 ? '...' : ''}`);
        }
      }
      console.log('');
    } catch (err) {
      console.log(`${service.name}: ❌ ERROR - ${err.message}\n`);
    }
  }
  
  console.log('💡 Tips:');
  console.log('  - If services show "PORT CLOSED", wait a moment and try again');
  console.log('  - Check Docker logs: cd infra && docker-compose logs <service-name>');
  console.log('  - Force rebuild images: cd infra && docker-compose up --build');
}

checkAllServices();