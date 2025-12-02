import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET || 'default_secret';

  try {
    const decoded = jwt.verify(token, jwtSecret) as { userId: number; email: string; roles: string[] };
    (req as any).userId = decoded.userId;
    (req as any).userEmail = decoded.email;
    (req as any).userRoles = decoded.roles;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }
};