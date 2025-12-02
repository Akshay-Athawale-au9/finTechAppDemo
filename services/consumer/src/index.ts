import dotenv from 'dotenv';
import { consumer } from './config/kafka';
import { pool } from './config/database';

dotenv.config();

async function startConsumer() {
  try {
    // Connect to Kafka
    await consumer.connect();
    await consumer.subscribe({ topic: 'ledger-events', fromBeginning: true });
    
    // Connect to database
    await pool.query('SELECT 1');
    console.log('Connected to database');
    
    // Start consuming messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          if (message.value) {
            const eventData = JSON.parse(message.value.toString());
            console.log('Received event:', eventData);
            
            // Insert into ledger_events table
            await pool.query(
              `INSERT INTO ledger_events (event_type, account_id, transaction_id, amount, currency, status, metadata) 
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [
                eventData.eventType,
                eventData.accountId,
                eventData.transactionId,
                eventData.amount,
                eventData.currency || 'USD',
                'processed',
                JSON.stringify(eventData)
              ]
            );
            
            // Insert into audit_logs table
            await pool.query(
              `INSERT INTO audit_logs (service_name, action, resource_type, resource_id, metadata) 
               VALUES ($1, $2, $3, $4, $5)`,
              [
                'consumer-service',
                'ledger_event_processed',
                'ledger_event',
                eventData.transactionId,
                JSON.stringify(eventData)
              ]
            );
            
            console.log('Event processed successfully');
          }
        } catch (error) {
          console.error('Error processing event:', error);
        }
      },
    });
    
    console.log('Consumer service started and listening for ledger events');
  } catch (error) {
    console.error('Error starting consumer:', error);
  }
}

startConsumer().catch(console.error);