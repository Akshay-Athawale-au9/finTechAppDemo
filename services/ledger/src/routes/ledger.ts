import { Router, Request, Response } from 'express';
import { pool } from '../config/database';

const router = Router();

// Get ledger entries for an account
router.get('/accounts/:accountId', async (req: Request, res: Response) => {
  try {
    const accountId = parseInt(req.params.accountId, 10);
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;
    
    if (isNaN(accountId)) {
      return res.status(400).json({ error: 'Invalid account ID' });
    }
    
    const offset = (page - 1) * size;
    
    const result = await pool.query(
      `SELECT l.*, t.transaction_type, t.description as transaction_description
       FROM ledger l
       JOIN transactions t ON l.transaction_id = t.id
       WHERE l.account_id = $1
       ORDER BY l.created_at DESC
       LIMIT $2 OFFSET $3`,
      [accountId, size, offset]
    );
    
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM ledger WHERE account_id = $1',
      [accountId]
    );
    
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / size);
    
    return res.json({
      entries: result.rows,
      pagination: {
        page,
        size,
        totalCount,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching ledger entries:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transactions for an account
router.get('/accounts/:accountId/transactions', async (req: Request, res: Response) => {
  try {
    const accountId = parseInt(req.params.accountId, 10);
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;
    
    if (isNaN(accountId)) {
      return res.status(400).json({ error: 'Invalid account ID' });
    }
    
    const offset = (page - 1) * size;
    
    const result = await pool.query(
      `SELECT * FROM transactions 
       WHERE account_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [accountId, size, offset]
    );
    
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM transactions WHERE account_id = $1',
      [accountId]
    );
    
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / size);
    
    return res.json({
      transactions: result.rows,
      pagination: {
        page,
        size,
        totalCount,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as ledgerRouter };