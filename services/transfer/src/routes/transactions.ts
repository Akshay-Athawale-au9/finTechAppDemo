import { Router, Request, Response } from 'express';
import { pool } from '../config/database';

const router = Router();

// Get paginated transactions
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;
    
    // Validate pagination parameters
    if (page < 1 || size < 1 || size > 100) {
      return res.status(400).json({ error: 'Invalid page or size parameters' });
    }
    
    const offset = (page - 1) * size;
    
    // In a real implementation, we would filter by authenticated user
    // For now, we'll return all transactions
    const result = await pool.query(
      `SELECT id, account_id, transaction_type, amount, currency, description, reference_id, status, created_at
       FROM transactions
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [size, offset]
    );
    
    const countResult = await pool.query('SELECT COUNT(*) FROM transactions');
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

export { router as transactionsRouter };