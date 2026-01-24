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

const isProduction = process.env.NODE_ENV === 'production';

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// 1. TRUST PROXY (Critical for Render/Production)
if (isProduction) {
  app.set('trust proxy', 1); // Trust first proxy (Render Load Balancer)
}

// 2. CORS CONFIGURATION
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5000';

console.log(`🔒 CORS Configured for: ${clientUrl}`);
console.log(`🌍 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);

app.use(cors({
  origin: clientUrl,
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. SESSION CONFIGURATION
if (isProduction && !process.env.SESSION_SECRET) {
  console.error("❌ CRITICAL: SESSION_SECRET must be set in production!");
  process.exit(1);
}

const PgSession = connectPgSimple(session);

app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    proxy: isProduction, // Important for secure cookies behind proxy
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true, // Prevents JS access to cookie
      secure: isProduction, // TRUE in production (HTTPS), FALSE locally (HTTP)
      sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site (Render<->Netlify), 'lax' for local
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
