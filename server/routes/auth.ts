import { Router } from 'express';
import passport from '../config/passport';
import { loginSchema } from '../utils/validation';
import type { Request, Response } from 'express';

const router = Router();

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', (req: Request, res: Response, next) => {
  // Validate input
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: 'Validation error',
      details: result.error.errors,
    });
  }

  // Authenticate with Passport
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: info?.message || 'Invalid credentials',
      });
    }

    // Login user (create session)
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to create session' });
      }

      // Set session expiration based on "remember me"
      if (result.data.rememberMe) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      } else {
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 1 day
      }

      return res.json({
        success: true,
        data: user,
        message: 'Login successful',
      });
    });
  })(req, res, next);
});

/**
 * POST /api/auth/logout
 * Logout current user
 */
router.post('/logout', (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to destroy session' });
      }

      res.clearCookie('connect.sid');
      return res.json({
        success: true,
        message: 'Logout successful',
      });
    });
  });
});

/**
 * GET /api/auth/me
 * Get current user session
 */
router.get('/me', (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  return res.json({
    success: true,
    data: req.user,
  });
});

export default router;
