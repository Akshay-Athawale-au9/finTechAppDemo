import express = require('express');
import cors = require('cors');
import helmet = require('helmet');
import dotenv = require('dotenv');
import { authRouter } from './routes/auth';
import { healthRouter } from './routes/health';

dotenv.config();

const app: express.Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet.default());
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRouter);
app.use('/health', healthRouter);

// Root endpoint
app.get('/', (req: express.Request, res: express.Response) => {
  res.json({ message: 'Auth Service is running' });
});

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});