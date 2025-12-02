import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { redisClient } from '../config/redis';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    // Check database connection
    const dbResult = await pool.query('SELECT 1');
    const dbStatus = dbResult.rowCount !== null ? 'OK' : 'ERROR';
    
    // Check Redis connection
    let redisStatus = 'ERROR';
    try {
      await redisClient.ping();
      redisStatus = 'OK';
    } catch (error) {
      // Redis status remains ERROR
    }
    
    return res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      services: {
        database: 'ERROR',
        redis: 'ERROR'
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as healthRouter };