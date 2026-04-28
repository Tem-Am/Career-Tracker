import express from 'express';
import { z } from 'zod';

import { loginUser, registerUser } from './auth.service';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function asyncHandler(
  fn: (req: express.Request, res: express.Response) => Promise<void>,
): express.RequestHandler {
  return (req, res, next) => {
    fn(req, res).catch(next);
  };
}

export const authRouter = express.Router();

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    try {
      const result = await registerUser(parsed.data);
      res.json(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to register';
      res.status(400).json({ error: message });
    }
  }),
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    try {
      const result = await loginUser(parsed.data);
      res.json(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to login';
      res.status(401).json({ error: message });
    }
  }),
);

