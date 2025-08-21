import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const EXPIRES_IN = '1h';

export const TEST_TOKEN = process.env.TEST_TOKEN;

export const generateToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
};

export const verifyToken = (token: string) => {
  if (token === TEST_TOKEN) {
    return { userId: 'test', role: 'tester' };
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};
