import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import { Pool as NeonPool } from '@neondatabase/serverless';
import pkg from 'pg';
const { Pool } = pkg;
import * as dotenv from 'dotenv';
import * as schema from './schema';

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Detect if we're running in a serverless environment (Render)
// or in a standard environment (Docker, local development)
const isServerless = (process.env.RENDER === 'true' || process.env.NODE_ENV === 'production') 
  && process.env.FORCE_STANDARD_DRIVER !== 'true';

let db;

if (isServerless) {
  // Use Neon serverless driver (WebSocket) for Render/Production
  console.log('🔌 Using Neon Serverless driver (WebSocket)');
  const pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNeon(pool, { schema });
} else {
  // Use node-postgres driver for Docker/Local development
  console.log('🔌 Using node-postgres driver');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  db = drizzleNode(pool, { schema });
}

export { db, schema };
