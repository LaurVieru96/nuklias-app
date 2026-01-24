// Shared types between client and server

// ============================================
// USER TYPES
// ============================================

export type UserRole = 'admin' | 'member';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// Internal type with password (never exposed to client)
export interface UserWithPassword extends User {
  password: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// ============================================
// LEAD TYPES
// ============================================

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'won' | 'lost';
export type LeadPriority = 'high' | 'medium' | 'low';
export type LeadSource = 'website_form' | 'manual' | 'import';

export interface Lead {
  id: string;
  // Contact Info
  name: string;
  email: string;
  phone?: string | null;
  location: string;
  // Business Info
  industry: string;
  businessType: string;
  challenge: string;
  message: string;
  // CRM Fields
  status: LeadStatus;
  priority: LeadPriority;
  assignedTo?: string | null; // User ID
  estimatedValue?: number | null;
  source: LeadSource;
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface CreateLeadInput {
  name: string;
  email: string;
  phone?: string | null;
  location: string;
  industry: string;
  businessType: string;
  challenge: string;
  message: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  assignedTo?: string | null;
  estimatedValue?: number | null;
  source?: LeadSource;
}

export interface UpdateLeadInput {
  name?: string;
  email?: string;
  phone?: string | null;
  location?: string;
  industry?: string;
  businessType?: string;
  challenge?: string;
  message?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  assignedTo?: string | null;
  estimatedValue?: number | null;
}

export interface LeadFilters {
  status?: LeadStatus[];
  priority?: LeadPriority[];
  assignedTo?: string;
  timeRange?: 'today' | 'week' | 'month' | 'last30';
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'name';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// ============================================
// TASK TYPES
// ============================================

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description?: string;
  // Assignment
  assignedTo: string; // User ID
  createdBy: string; // User ID
  // Status & Priority
  status: TaskStatus;
  priority: TaskPriority;
  // Dates
  dueDate?: Date;
  completedAt?: Date;
  // Relations
  relatedLeadId?: string;
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  assignedTo: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  relatedLeadId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  assignedTo?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  completedAt?: Date;
  relatedLeadId?: string;
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignedTo?: string;
  dueDate?: 'overdue' | 'today' | 'week' | 'month';
  search?: string;
  sortBy?: 'createdAt' | 'dueDate' | 'priority';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// ============================================
// DASHBOARD STATS TYPES
// ============================================

export interface DashboardStats {
  newLeadsThisMonth: number;
  newLeadsChange: number; // % vs last month
  activeTasks: number;
  urgentTasks: number;
  conversionRate: number; // won / (won + lost)
  conversionChange: number; // % vs last month
  teamActivity: number; // active users last 7 days
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: any;
}

export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  message?: string;
}
