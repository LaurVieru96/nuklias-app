import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '@shared/types';

/**
 * Middleware to require authentication
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized', message: 'You must be logged in' });
  }
  next();
}

/**
 * Middleware to require specific roles
 */
export function requireRole(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized', message: 'You must be logged in' });
    }

    const user = req.user as any;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to access this resource' });
    }

    next();
  };
}

/**
 * Middleware to attach user to request (optional auth)
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  // Just continue - user will be available if authenticated
  next();
}
