import type { UserRole } from '../models/User';

export interface AuthContext {
  userId: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      /** Set by `requireAuth` once the bearer token has been verified. */
      auth?: AuthContext;
    }
  }
}
