import { db } from './index';
import { users } from './schema';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const SALT_ROUNDS = 10;

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Create initial admin user
    const adminPassword = await bcrypt.hash('Admin123!', SALT_ROUNDS);
    
    const [admin] = await db.insert(users).values({
      email: 'admin@nuklias.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
    }).returning();

    console.log('✅ Created admin user:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: Admin123! (CHANGE THIS AFTER FIRST LOGIN!)`);
    console.log(`   Role: ${admin.role}\n`);

    // Optional: Create a test member user
    const memberPassword = await bcrypt.hash('Member123!', SALT_ROUNDS);
    
    const [member] = await db.insert(users).values({
      email: 'member@nuklias.com',
      password: memberPassword,
      firstName: 'Test',
      lastName: 'Member',
      role: 'member',
      isActive: true,
    }).returning();

    console.log('✅ Created member user:');
    console.log(`   Email: ${member.email}`);
    console.log(`   Password: Member123!`);
    console.log(`   Role: ${member.role}\n`);

    console.log('🎉 Database seeded successfully!\n');
    console.log('⚠️  IMPORTANT: Change the default passwords after first login!\n');

  } catch (error: any) {
    if (error.code === '23505') {
      console.log('⚠️  Users already exist. Skipping seed.\n');
    } else {
      console.error('❌ Error seeding database:', error);
      throw error;
    }
  }

  process.exit(0);
}

seed();
