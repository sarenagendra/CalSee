import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { getUserById } from '../storage/store';
import type { User } from '../types';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    const user = getUserById(decoded.userId) as User | undefined;
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    (req as Request & { user?: User }).user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
}
