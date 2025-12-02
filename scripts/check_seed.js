const { Client } = require('pg');

// Get database connection details from environment variables or use defaults
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'fintech',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

async function checkSeedData() {
  console.log('Checking seeded data in database...\n');
  
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Connected to database successfully!\n');
    
    // Check if tables exist
    console.log('--- Checking Tables ---');
    const tables = ['users', 'accounts'];
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)`, [table]);
        console.log(`  ${table}: ${result.rows[0].exists ? '✅ EXISTS' : '❌ MISSING'}`);
      } catch (err) {
        console.log(`  ${table}: ❌ ERROR - ${err.message}`);
      }
    }
    
    // Check users
    console.log('\n--- Users ---');
    try {
      const usersResult = await client.query('SELECT id, email, roles FROM users ORDER BY id');
      console.log(`Found ${usersResult.rows.length} users:`);
      if (usersResult.rows.length > 0) {
        usersResult.rows.forEach(user => {
          console.log(`  - ID: ${user.id}, Email: ${user.email}, Roles: ${user.roles}`);
        });
      } else {
        console.log('  No users found');
        
        // Let's try to see if there are any records at all
        const countResult = await client.query('SELECT COUNT(*) as count FROM users');
        console.log(`  Total user records: ${countResult.rows[0].count}`);
      }
    } catch (err) {
      console.log(`  Error querying users: ${err.message}`);
    }
    
    // Check accounts
    console.log('\n--- Accounts ---');
    try {
      const accountsResult = await client.query('SELECT id, user_id, account_number, account_type, balance, currency FROM accounts ORDER BY id');
      console.log(`Found ${accountsResult.rows.length} accounts:`);
      if (accountsResult.rows.length > 0) {
        accountsResult.rows.forEach(account => {
          console.log(`  - ID: ${account.id}, User ID: ${account.user_id}, Account: ${account.account_number}, Type: ${account.account_type}, Balance: $${parseFloat(account.balance).toFixed(2)}, Currency: ${account.currency}`);
        });
      } else {
        console.log('  No accounts found');
        
        // Let's try to see if there are any records at all
        const countResult = await client.query('SELECT COUNT(*) as count FROM accounts');
        console.log(`  Total account records: ${countResult.rows[0].count}`);
      }
    } catch (err) {
      console.log(`  Error querying accounts: ${err.message}`);
    }
    
    // Check sequences
    console.log('\n--- Sequences ---');
    try {
      const userSeqResult = await client.query(`SELECT last_value FROM users_id_seq`);
      console.log(`  users_id_seq last_value: ${userSeqResult.rows[0].last_value}`);
    } catch (err) {
      console.log(`  Error checking users_id_seq: ${err.message}`);
    }
    
    try {
      const accountSeqResult = await client.query(`SELECT last_value FROM accounts_id_seq`);
      console.log(`  accounts_id_seq last_value: ${accountSeqResult.rows[0].last_value}`);
    } catch (err) {
      console.log(`  Error checking accounts_id_seq: ${err.message}`);
    }
    
    console.log('\n✅ Database check completed!');
    
  } catch (err) {
    console.error('❌ Error checking seed data:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkSeedData();