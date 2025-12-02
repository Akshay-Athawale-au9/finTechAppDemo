import { Router, Request, Response } from 'express';
import { pool } from '../config/database';

const router = Router();

// Check database migration status
router.get('/migrations', async (req: Request, res: Response) => {
  try {
    // Check if required tables exist
    const requiredTables = [
      'users',
      'accounts',
      'transactions',
      'ledger',
      'transfers',
      'ledger_events',
      'audit_logs',
      'documents'
    ];
    
    const results = [];
    
    for (const table of requiredTables) {
      const result = await pool.query(
        'SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)',
        [table]
      );
      
      results.push({
        table,
        exists: result.rows[0].exists
      });
    }
    
    return res.json({
      status: 'Migration status check completed',
      tables: results
    });
  } catch (error) {
    console.error('Migration status check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent audit logs
router.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (limit < 1 || limit > 100) {
      return res.status(400).json({ error: 'Invalid limit parameter (1-100)' });
    }
    
    const result = await pool.query(
      `SELECT id, service_name, action, resource_type, resource_id, user_id, ip_address, user_agent, metadata, created_at
       FROM audit_logs
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );
    
    return res.json({
      logs: result.rows
    });
  } catch (error) {
    console.error('Audit logs fetch error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as adminRouter };