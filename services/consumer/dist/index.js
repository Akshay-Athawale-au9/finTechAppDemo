"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const kafka_1 = require("./config/kafka");
const database_1 = require("./config/database");
dotenv_1.default.config();
async function startConsumer() {
    try {
        await kafka_1.consumer.connect();
        await kafka_1.consumer.subscribe({ topic: 'ledger-events', fromBeginning: true });
        await database_1.pool.query('SELECT 1');
        console.log('Connected to database');
        await kafka_1.consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    if (message.value) {
                        const eventData = JSON.parse(message.value.toString());
                        console.log('Received event:', eventData);
                        await database_1.pool.query(`INSERT INTO ledger_events (event_type, account_id, transaction_id, amount, currency, status, metadata) 
               VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
                            eventData.eventType,
                            eventData.accountId,
                            eventData.transactionId,
                            eventData.amount,
                            eventData.currency || 'USD',
                            'processed',
                            JSON.stringify(eventData)
                        ]);
                        await database_1.pool.query(`INSERT INTO audit_logs (service_name, action, resource_type, resource_id, metadata) 
               VALUES ($1, $2, $3, $4, $5)`, [
                            'consumer-service',
                            'ledger_event_processed',
                            'ledger_event',
                            eventData.transactionId,
                            JSON.stringify(eventData)
                        ]);
                        console.log('Event processed successfully');
                    }
                }
                catch (error) {
                    console.error('Error processing event:', error);
                }
            },
        });
        console.log('Consumer service started and listening for ledger events');
    }
    catch (error) {
        console.error('Error starting consumer:', error);
    }
}
startConsumer().catch(console.error);
//# sourceMappingURL=index.js.map