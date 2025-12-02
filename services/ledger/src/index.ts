import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { ledgerRouter } from './routes/ledger';
import { healthRouter } from './routes/health';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/ledger', ledgerRouter);
app.use('/health', healthRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Ledger Service is running' });
});

app.listen(PORT, () => {
  console.log(`Ledger service running on port ${PORT}`);
});