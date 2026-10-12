import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { USER_ROLES, type UserRole } from '../models/User';
import type { AuthContext } from '../types/express';

interface TokenPayload {
  sub: string;
  role: UserRole;
}

export function signToken({ userId, role }: AuthContext): string {
  const payload: TokenPayload = { sub: userId, role };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    algorithm: 'HS256',
  });
}

/** Returns the auth context for a valid token, or null for an invalid/expired one. */
export function verifyToken(token: string): AuthContext | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
    if (
      typeof decoded === 'object' &&
      typeof decoded.sub === 'string' &&
      USER_ROLES.includes(decoded.role as UserRole)
    ) {
      return { userId: decoded.sub, role: decoded.role as UserRole };
    }
    return null;
  } catch {
    return null;
  }
}
