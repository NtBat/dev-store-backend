import { Request, Response, NextFunction } from 'express';
import { getUserByToken } from '../services/user';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const tokenSplit = authHeader.split('Bearer ');
  if (!tokenSplit[1]) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = tokenSplit[1];

  const user = await getUserByToken(token);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  (req as any).userId = user.id;
  (req as any).userRole = user.role;
  next();
};

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const userRole = (req as any).userRole;

  if (!userRole || userRole !== 'admin') {
    res.status(403).json({ error: 'Access denied. Admin only.' });
    return;
  }

  next();
};
