const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'fintech',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

async function checkUserAccounts() {
  try {
    console.log('Checking user accounts in database...');
    
    // Check if our test user exists
    const userResult = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      ['testuser@example.com']
    );
    
    if (userResult.rows.length === 0) {
      console.log('Test user not found in database');
      return;
    }
    
    const user = userResult.rows[0];
    console.log(`Found user: ID=${user.id}, Email=${user.email}`);
    
    // Check if accounts exist for this user
    const accountResult = await pool.query(
      'SELECT id, account_number, account_type, balance, currency FROM accounts WHERE user_id = $1',
      [user.id]
    );
    
    if (accountResult.rows.length === 0) {
      console.log('No accounts found for this user');
      return;
    }
    
    console.log(`Found ${accountResult.rows.length} account(s) for this user:`);
    accountResult.rows.forEach(account => {
      console.log(`  Account ID: ${account.id}`);
      console.log(`  Account Number: ${account.account_number}`);
      console.log(`  Account Type: ${account.account_type}`);
      console.log(`  Balance: ${account.balance}`);
      console.log(`  Currency: ${account.currency}`);
      console.log('  ---');
    });
    
  } catch (error) {
    console.error('Error checking user accounts:', error);
  } finally {
    await pool.end();
  }
}

checkUserAccounts();