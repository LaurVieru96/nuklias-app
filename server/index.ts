import express from 'express';
import session from 'express-session';
import * as dotenv from 'dotenv';
import cors from 'cors';
import connectPgSimple from 'connect-pg-simple';
import { Pool } from '@neondatabase/serverless';
import './config/passport'; // Initialize Passport configuration
import passport from 'passport';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import leadRoutes from './routes/leads';
import taskRoutes from './routes/tasks';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5000',
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
const PgSession = connectPgSimple(session);

app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-domain
    },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Users routes (admin only)
app.use('/api/users', userRoutes);

// Leads routes
app.use('/api/leads', leadRoutes);

// Tasks routes
app.use('/api/tasks', taskRoutes);

// TODO: Add more routes
// import statsRoutes from './routes/stats';
// app.use('/api/stats', statsRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
