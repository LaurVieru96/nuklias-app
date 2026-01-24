import { db } from '../db/index';
import { users } from '../db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import type { User, UserWithPassword, CreateUserInput, UpdateUserInput } from '@shared/types';
import { hashPassword } from '../utils/password';

/**
 * Find user by email (excluding soft-deleted users)
 */
export async function findUserByEmail(email: string): Promise<UserWithPassword | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1);

  return user || null;
}

/**
 * Find user by ID (excluding soft-deleted users)
 */
export async function findUserById(id: string): Promise<User | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .limit(1);

  return user || null;
}

/**
 * Create a new user
 */
export async function createUser(input: CreateUserInput): Promise<User> {
  const hashedPassword = await hashPassword(input.password);

  const [user] = await db
    .insert(users)
    .values({
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
      isActive: true,
    })
    .returning();

  return user;
}

/**
 * Update user
 */
export async function updateUser(id: string, input: UpdateUserInput): Promise<User | null> {
  const [user] = await db
    .update(users)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .returning();

  return user || null;
}

/**
 * Soft delete user
 */
export async function softDeleteUser(id: string): Promise<boolean> {
  const [user] = await db
    .update(users)
    .set({
      deletedAt: new Date(),
      isActive: false,
    })
    .where(eq(users.id, id))
    .returning();

  return !!user;
}

/**
 * List all users (excluding soft-deleted)
 */
export async function listUsers(limit = 20, offset = 0) {
  const allUsers = await db
    .select()
    .from(users)
    .where(isNull(users.deletedAt))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: db.$count(users) })
    .from(users)
    .where(isNull(users.deletedAt));

  return {
    data: allUsers,
    total: Number(count),
    limit,
    offset,
    hasMore: offset + limit < Number(count),
  };
}
