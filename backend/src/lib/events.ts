import jwt from 'jsonwebtoken';
import { z } from 'zod';
import type { Response } from 'express';
import { redis } from './redis';

const jwtPayloadSchema = z.object({
  userId: z.string().uuid(),
});

type Client = {
  res: Response;
  userId: string;
};

const clientsByUserId = new Map<string, Set<Response>>();

export function getUserIdFromToken(token: string): string | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const decoded: unknown = jwt.verify(token, secret);
    const parsed = jwtPayloadSchema.safeParse(decoded);
    if (!parsed.success) return null;
    return parsed.data.userId;
  } catch {
    return null;
  }
}

export function addSseClient(input: Client) {
  const set = clientsByUserId.get(input.userId) ?? new Set<Response>();
  set.add(input.res);
  clientsByUserId.set(input.userId, set);
}

export function removeSseClient(userId: string, res: Response) {
  const set = clientsByUserId.get(userId);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) clientsByUserId.delete(userId);
}

export function sendSse(userId: string, event: string, data: unknown) {
  const set = clientsByUserId.get(userId);
  if (!set || set.size === 0) return;
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of set) {
    res.write(payload);
  }
}

const CHANNEL = 'jt-events';
const subscriber = redis.duplicate();

subscriber.on('error', (err) => {
  console.error('[events] redis subscriber error:', err);
});

void subscriber.subscribe(CHANNEL);

subscriber.on('message', (_channel, message) => {
  try {
    const parsed = JSON.parse(message) as { userId: string; event: string; data: unknown };
    if (!parsed?.userId || !parsed?.event) return;
    sendSse(parsed.userId, parsed.event, parsed.data);
  } catch (err) {
    console.error('[events] bad message:', err);
  }
});

export function publishEvent(input: { userId: string; event: string; data: unknown }) {
  return redis.publish(CHANNEL, JSON.stringify(input));
}

