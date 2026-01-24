import { pgTable, text, timestamp, boolean, integer, uuid } from 'drizzle-orm/pg-core';
import type { UserRole, LeadStatus, LeadPriority, LeadSource, TaskStatus, TaskPriority } from '@shared/types';

// ============================================
// USERS TABLE
// ============================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(), // bcrypt hashed
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  role: text('role').notNull().$type<UserRole>(),
  avatar: text('avatar'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// ============================================
// LEADS TABLE
// ============================================

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Contact Info
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  location: text('location').notNull(),
  // Business Info
  industry: text('industry').notNull(),
  businessType: text('business_type').notNull(),
  challenge: text('challenge').notNull(),
  message: text('message').notNull(),
  // CRM Fields
  status: text('status').notNull().$type<LeadStatus>().default('new'),
  priority: text('priority').notNull().$type<LeadPriority>().default('medium'),
  assignedTo: uuid('assigned_to').references(() => users.id),
  estimatedValue: integer('estimated_value'),
  source: text('source').notNull().$type<LeadSource>().default('manual'),
  // Metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// ============================================
// TASKS TABLE
// ============================================

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  // Assignment
  assignedTo: uuid('assigned_to').notNull().references(() => users.id),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  // Status & Priority
  status: text('status').notNull().$type<TaskStatus>().default('todo'),
  priority: text('priority').notNull().$type<TaskPriority>().default('medium'),
  // Dates
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),
  // Relations
  relatedLeadId: uuid('related_lead_id').references(() => leads.id),
  // Metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type UserRow = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;

export type LeadRow = typeof leads.$inferSelect;
export type LeadInsert = typeof leads.$inferInsert;

export type TaskRow = typeof tasks.$inferSelect;
export type TaskInsert = typeof tasks.$inferInsert;
