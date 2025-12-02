import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { transfersRouter } from './routes/transfers';
import { healthRouter } from './routes/health';
import { webhookRouter } from './routes/webhook';
import { externalRouter } from './routes/external';
import { documentsRouter } from './routes/documents';
import { transactionsRouter } from './routes/transactions';
import { adminRouter } from './routes/admin';
import { redisClient } from './config/redis';
import { producer } from './config/kafka';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Connect to Redis
redisClient.connect().catch(console.error);

// Connect to Kafka
producer.connect().catch(console.error);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/transfer', transfersRouter);
app.use('/health', healthRouter);
app.use('/webhook', webhookRouter);
app.use('/external', externalRouter);
app.use('/documents', documentsRouter);
app.use('/transactions', transactionsRouter);
app.use('/admin', adminRouter);

// Root endpoint
app.get('/', (req: express.Request, res: express.Response) => {
  res.json({ message: 'Transfer Service is running' });
});

app.listen(PORT, () => {
  console.log(`Transfer service running on port ${PORT}`);
});