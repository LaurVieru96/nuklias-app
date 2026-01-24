import { z } from 'zod';

// ============================================
// AUTH SCHEMAS
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

// ============================================
// USER SCHEMAS
// ============================================

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  role: z.enum(['admin', 'member']),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  role: z.enum(['admin', 'member']).optional(),
  isActive: z.boolean().optional(),
});

// ============================================
// LEAD SCHEMAS
// ============================================

export const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  location: z.string().min(1, 'Location is required').max(100),
  industry: z.string().min(1, 'Industry is required').max(100),
  businessType: z.string().min(1, 'Business type is required').max(200),
  challenge: z.string().min(1, 'Challenge is required').max(500),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  assignedTo: z.string().uuid().optional(),
  estimatedValue: z.number().int().positive().optional(),
  source: z.enum(['website_form', 'manual', 'import']).optional(),
});

export const updateLeadSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().min(1).max(100).optional(),
  industry: z.string().min(1).max(100).optional(),
  businessType: z.string().min(1).max(200).optional(),
  challenge: z.string().min(1).max(500).optional(),
  message: z.string().min(10).max(2000).optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  assignedTo: z.string().uuid().nullable().optional(),
  estimatedValue: z.number().int().positive().nullable().optional(),
});

export const leadFiltersSchema = z.object({
  status: z.array(z.enum(['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost'])).optional(),
  priority: z.array(z.enum(['high', 'medium', 'low'])).optional(),
  assignedTo: z.string().uuid().optional(),
  timeRange: z.enum(['today', 'week', 'month', 'last30']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'name']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
});

// ============================================
// TASK SCHEMAS
// ============================================

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  assignedTo: z.string().uuid('Invalid user ID'),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  dueDate: z.string().datetime().optional().or(z.date().optional()),
  relatedLeadId: z.string().uuid().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  assignedTo: z.string().uuid().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  dueDate: z.string().datetime().nullable().optional().or(z.date().nullable().optional()),
  completedAt: z.string().datetime().nullable().optional().or(z.date().nullable().optional()),
  relatedLeadId: z.string().uuid().nullable().optional(),
});

export const taskFiltersSchema = z.object({
  status: z.array(z.enum(['todo', 'in_progress', 'done'])).optional(),
  priority: z.array(z.enum(['high', 'medium', 'low'])).optional(),
  assignedTo: z.string().uuid().optional(),
  dueDate: z.enum(['overdue', 'today', 'week', 'month']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'dueDate', 'priority']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
});
