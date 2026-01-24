import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { findUserByEmail, findUserById } from '../services/userService';
import { comparePassword } from '../utils/password';
import type { UserWithPassword } from '@shared/types';

/**
 * Configure Passport Local Strategy
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        // Find user by email
        const user = await findUserByEmail(email);

        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        // Check if user is active
        if (!user.isActive) {
          return done(null, false, { message: 'Account is deactivated' });
        }

        // Verify password
        const isValid = await comparePassword(password, user.password);

        if (!isValid) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        // Success - return user without password
        const { password: _, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error);
      }
    }
  )
);

/**
 * Serialize user for session
 */
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

/**
 * Deserialize user from session
 */
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await findUserById(id);

    if (!user) {
      return done(null, false);
    }

    // User already doesn't have password (findUserById returns User, not UserWithPassword)
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
