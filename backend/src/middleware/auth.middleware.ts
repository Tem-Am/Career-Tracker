import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

const jwtPayloadSchema = z.object({
  userId: z.string().uuid(),
});

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization');
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: 'JWT_SECRET is not configured' });
    return;
  }

  try {
    const decoded: unknown = jwt.verify(token, secret);
    const parsed = jwtPayloadSchema.safeParse(decoded);
    if (!parsed.success) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    req.user = { id: parsed.data.userId };
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

