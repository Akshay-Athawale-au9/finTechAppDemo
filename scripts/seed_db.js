const fs = require('fs');
const { Client } = require('pg');
const path = require('path');

// Get database connection details from environment variables or use defaults
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'fintech',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

async function seedDatabase() {
  console.log('Seeding database...');
  
  const client = new Client(config);
  
  try {
    // Test database connection
    console.log('Testing database connection...');
    await client.connect();
    console.log('Database connection successful!');
    
    // Read seed data SQL file
    const seedFilePath = path.join(__dirname, '..', 'seed', 'seed_data.sql');
    const seedSQL = fs.readFileSync(seedFilePath, 'utf8');
    
    // Split the SQL file into individual statements, being careful with comments
    // We'll split on semicolons but preserve multi-line statements
    let statements = [];
    let currentStatement = '';
    let lines = seedSQL.split('\n');
    
    for (let line of lines) {
      // Skip empty lines
      if (line.trim() === '') continue;
      
      // Skip comment lines
      if (line.trim().startsWith('--')) continue;
      
      currentStatement += line + ' ';
      
      // If line ends with semicolon, we have a complete statement
      if (line.trim().endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
    
    // Add any remaining statement
    if (currentStatement.trim() !== '') {
      statements.push(currentStatement.trim());
    }
    
    console.log(`Found ${statements.length} statements to execute:`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim() === '') {
        // Skip empty statements
        console.log(`Skipping statement ${i+1}: Empty`);
        continue;
      }
      
      try {
        console.log(`Executing statement ${i+1}:`, statement.substring(0, 50) + (statement.length > 50 ? '...' : ''));
        const result = await client.query(statement);
        console.log(`  Result: ${result.rowCount !== null ? result.rowCount + ' rows affected' : 'Success'}`);
      } catch (err) {
        // Handle conflicts gracefully (ON CONFLICT clauses)
        if (err.code !== '23505') { // Unique violation
          console.error(`  Error executing statement ${i+1}:`, err.message);
          throw err;
        }
        console.log(`  Skipping duplicate entry (conflict handled)`);
      }
    }
    
    console.log('Database seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding database:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedDatabase();