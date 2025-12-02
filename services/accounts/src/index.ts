import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { accountsRouter } from './routes/accounts';
import { healthRouter } from './routes/health';
import { authenticateToken } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/accounts', authenticateToken, accountsRouter);
app.use('/health', healthRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Accounts Service is running' });
});

app.listen(PORT, () => {
  console.log(`Accounts service running on port ${PORT}`);
});