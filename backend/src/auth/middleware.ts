import { verifyToken } from '@/auth/jwt';
import { Context } from 'hono';

export const authMiddleware = async (c: Context, next: () => Promise<void>) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader) return c.json({ error: 'No token provided' }, 401);

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) return c.json({ error: 'Invalid token' }, 401);

  c.set('user', decoded);
  await next();
};
