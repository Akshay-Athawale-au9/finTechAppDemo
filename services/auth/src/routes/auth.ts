import { Router, Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { pool } from '../config/database';

const router = Router();

// Register a new user
router.post('/register', async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { email, password, roles = ['user'] } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Start transaction
    await client.query('BEGIN');

    // Insert new user
    const userResult = await client.query(
      'INSERT INTO users (email, password_hash, roles) VALUES ($1, $2, $3) RETURNING id, email, roles',
      [email, hashedPassword, roles]
    );

    const user = userResult.rows[0];
    const userId = user.id;

    // Generate a unique account number
    const accountNumber = `ACC${String(userId).padStart(3, '0')}${Math.floor(Math.random() * 1000)}`;

    // Create a default checking account for the user
    const accountResult = await client.query(
      `INSERT INTO accounts (user_id, account_number, account_type, balance, currency) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, account_number, account_type, balance, currency, status, created_at`,
      [userId, accountNumber, 'checking', 0.00, 'USD']
    );

    const account = accountResult.rows[0];

    await client.query('COMMIT');

    return res.status(201).json({ 
      user,
      account
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, email, password_hash, roles FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const jwtSecret = process.env.JWT_SECRET || 'default_secret';
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret';
    
    // Convert expiresIn to number of seconds
    const accessTokenExpiresIn = process.env.JWT_EXPIRES_IN ? 
      parseInt(process.env.JWT_EXPIRES_IN) : 3600; // 1 hour default
    const refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN ? 
      parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN) : 86400; // 24 hours default
    
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, roles: user.roles },
      jwtSecret,
      { expiresIn: accessTokenExpiresIn } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email },
      refreshTokenSecret,
      { expiresIn: refreshTokenExpiresIn } as jwt.SignOptions
    );

    return res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh token
router.post('/refresh', (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret';
    
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      refreshTokenSecret
    ) as { userId: string; email: string };

    // Generate new access token
    const jwtSecret = process.env.JWT_SECRET || 'default_secret';
    
    // Convert expiresIn to number of seconds
    const newAccessTokenExpiresIn = process.env.JWT_EXPIRES_IN ? 
      parseInt(process.env.JWT_EXPIRES_IN) : 3600; // 1 hour default

    const newAccessToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      jwtSecret,
      { expiresIn: newAccessTokenExpiresIn } as jwt.SignOptions
    );

    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

export { router as authRouter };