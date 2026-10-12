import type { Request, RequestHandler } from 'express';
import type { UserRole } from '../models/User';
import { verifyToken } from '../services/token';
import type { AuthContext } from '../types/express';
import { AppError } from '../utils/AppError';

/** Verifies the `Authorization: Bearer <token>` header and attaches `req.auth`. */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : undefined;
  if (!token) {
    throw AppError.unauthorized();
  }

  const auth = verifyToken(token);
  if (!auth) {
    throw AppError.unauthorized('Your session has expired. Please log in again.');
  }
  req.auth = auth;
  next();
};

/** Must run after `requireAuth`. */
export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      throw AppError.forbidden(`Only ${roles.join(' or ')} accounts can do this.`);
    }
    next();
  };
}

/** Typed accessor for handlers mounted behind `requireAuth`. */
export function getAuth(req: Request): AuthContext {
  if (!req.auth) {
    throw AppError.unauthorized();
  }
  return req.auth;
}
