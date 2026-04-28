import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';

import { db } from '../../lib/db';
import { users } from '../../lib/schema';

function requireJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is required');
  return secret;
}

function signToken(userId: string): string {
  return jwt.sign({ userId }, requireJwtSecret(), { expiresIn: '7d' });
}

export async function registerUser(input: {
  email: string;
  password: string;
}): Promise<{ token: string; user: { id: string; email: string } }> {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);
  if (existing.length > 0) {
    throw new Error('Email already in use');
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const created = await db
    .insert(users)
    .values({
      email: input.email,
      passwordHash,
    })
    .returning({ id: users.id, email: users.email });

  const user = created[0];
  if (!user) {
    throw new Error('Failed to create user');
  }

  return { token: signToken(user.id), user };
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<{ token: string; user: { id: string; email: string } }> {
  const rows = await db
    .select({ id: users.id, email: users.email, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  const row = rows[0];
  if (!row) {
    throw new Error('Invalid credentials');
  }

  const ok = await bcrypt.compare(input.password, row.passwordHash);
  if (!ok) {
    throw new Error('Invalid credentials');
  }

  return { token: signToken(row.id), user: { id: row.id, email: row.email } };
}

