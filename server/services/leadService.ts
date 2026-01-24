import { db } from '../db/index';
import { leads } from '../db/schema';
import { eq, and, isNull, sql, ilike, or, gte, lte } from 'drizzle-orm';
import type { Lead, CreateLeadInput, UpdateLeadInput, LeadFilters } from '@shared/types';

/**
 * List leads with filters and pagination
 */
export async function listLeads(filters: LeadFilters = {}, limit = 20, offset = 0) {
  const conditions = [isNull(leads.deletedAt)];

  // Status filter
  if (filters.status && filters.status.length > 0) {
    conditions.push(sql`${leads.status} = ANY(${filters.status})`);
  }

  // Priority filter
  if (filters.priority && filters.priority.length > 0) {
    conditions.push(sql`${leads.priority} = ANY(${filters.priority})`);
  }

  // Assigned to filter
  if (filters.assignedTo) {
    conditions.push(eq(leads.assignedTo, filters.assignedTo));
  }

  // Search filter (name, email)
  if (filters.search) {
    conditions.push(
      or(
        ilike(leads.name, `%${filters.search}%`),
        ilike(leads.email, `%${filters.search}%`)
      )!
    );
  }

  // Date range filter
  if (filters.startDate) {
    conditions.push(gte(leads.createdAt, new Date(filters.startDate)));
  }
  if (filters.endDate) {
    conditions.push(lte(leads.createdAt, new Date(filters.endDate)));
  }

  const whereClause = and(...conditions);

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(leads)
    .where(whereClause);

  // Get paginated data
  const data = await db
    .select()
    .from(leads)
    .where(whereClause)
    .orderBy(sql`${leads.createdAt} DESC`)
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
 * Find lead by ID
 */
export async function findLeadById(id: string): Promise<Lead | null> {
  const [lead] = await db
    .select()
    .from(leads)
    .where(and(eq(leads.id, id), isNull(leads.deletedAt)))
    .limit(1);

  return lead || null;
}

/**
 * Create new lead
 */
export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const [lead] = await db
    .insert(leads)
    .values({
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return lead;
}

/**
 * Update lead
 */
export async function updateLead(id: string, input: UpdateLeadInput): Promise<Lead | null> {
  const [lead] = await db
    .update(leads)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(and(eq(leads.id, id), isNull(leads.deletedAt)))
    .returning();

  return lead || null;
}

/**
 * Soft delete lead
 */
export async function softDeleteLead(id: string): Promise<boolean> {
  const [lead] = await db
    .update(leads)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(leads.id, id), isNull(leads.deletedAt)))
    .returning();

  return !!lead;
}
