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

async function runMigrations() {
  console.log('Running database migrations...');
  
  const client = new Client(config);
  
  try {
    // Test database connection
    console.log('Testing database connection...');
    await client.connect();
    console.log('Database connection successful!');
    
    // Get all migration files and sort them
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`Found ${migrationFiles.length} migration files`);
    
    // Run each migration as a single transaction
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      console.log(`Running migration: ${file}`);
      
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        // Execute the entire migration file as one transaction
        console.log('  Executing migration file...');
        await client.query(sql);
        console.log(`  Migration ${file} completed successfully`);
      } catch (err) {
        console.error(`Error executing migration ${file}:`, err.message);
        throw err;
      }
    }
    
    console.log('Database migrations completed successfully!');
  } catch (err) {
    console.error('Error running database migrations:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();