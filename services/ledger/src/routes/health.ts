import { Router, Request, Response } from 'express';
import { pool } from '../config/database';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    // Check database connection
    const dbResult = await pool.query('SELECT 1');
    const dbStatus = dbResult.rowCount !== null ? 'OK' : 'ERROR';
    
    return res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      services: {
        database: 'ERROR'
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as healthRouter };