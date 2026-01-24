import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as schema from './schema';

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create Neon Pool (WebSocket connection)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create Drizzle instance with Pool
export const db = drizzle(pool, { schema });

// Export schema for use in services
export { schema };
