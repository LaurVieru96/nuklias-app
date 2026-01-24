import { db } from '../db/index';
import { tasks } from '../db/schema';
import { eq, and, isNull, sql, ilike, or, gte, lte } from 'drizzle-orm';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskFilters } from '@shared/types';

/**
 * List tasks with filters and pagination
 */
export async function listTasks(filters: TaskFilters = {}, limit = 20, offset = 0) {
  const conditions = [isNull(tasks.deletedAt)];

  // Status filter
  if (filters.status && filters.status.length > 0) {
    conditions.push(sql`${tasks.status} = ANY(${filters.status})`);
  }

  // Priority filter
  if (filters.priority && filters.priority.length > 0) {
    conditions.push(sql`${tasks.priority} = ANY(${filters.priority})`);
  }

  // Assigned to filter
  if (filters.assignedTo) {
    conditions.push(eq(tasks.assignedTo, filters.assignedTo));
  }

  // Search filter (title, description)
  if (filters.search) {
    conditions.push(
      or(
        ilike(tasks.title, `%${filters.search}%`),
        ilike(tasks.description, `%${filters.search}%`)
      )!
    );
  }

  const whereClause = and(...conditions);

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(tasks)
    .where(whereClause);

  // Get paginated data
  const data = await db
    .select()
    .from(tasks)
    .where(whereClause)
    .orderBy(sql`${tasks.createdAt} DESC`)
    .limit(limit)
    .offset(offset);

  return {
    data,
    total: Number(count),
    limit,
    offset,
    hasMore: offset + limit < Number(count),
  };
}

/**
 * Find task by ID
 */
export async function findTaskById(id: string): Promise<Task | null> {
  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), isNull(tasks.deletedAt)))
    .limit(1);

  return task || null;
}

/**
 * Create new task
 */
export async function createTask(input: CreateTaskInput, createdBy: string): Promise<Task> {
  const [task] = await db
    .insert(tasks)
    .values({
      ...input,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return task;
}

/**
 * Update task
 */
export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task | null> {
  const [task] = await db
    .update(tasks)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(and(eq(tasks.id, id), isNull(tasks.deletedAt)))
    .returning();

  return task || null;
}

/**
 * Delete task
 */
export async function deleteTask(id: string): Promise<boolean> {
  const [task] = await db
    .update(tasks)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(tasks.id, id), isNull(tasks.deletedAt)))
    .returning();

  return !!task;
}
