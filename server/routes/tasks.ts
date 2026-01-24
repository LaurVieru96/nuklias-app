import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  listTasks,
  findTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../services/taskService';
import { createTaskSchema, updateTaskSchema } from '../utils/validation';
import type { Request, Response } from 'express';

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * GET /api/tasks
 * List tasks with filters and pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    // Helper to parse array fields
    const parseArray = (input: any) => {
        if (Array.isArray(input)) return input;
        if (typeof input === 'string') return input.split(',');
        return undefined;
    };

    const filters = {
      status: parseArray(req.query.status),
      priority: parseArray(req.query.priority),
      assignedTo: req.query.assignedTo as string,
      search: req.query.search as string,
    };

    const result = await listTasks(filters, limit, offset);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.hasMore,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch tasks', message: error.message });
  }
});

/**
 * GET /api/tasks/:id
 * Get task by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const task = await findTaskById(req.params.id as string);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch task', message: error.message });
  }
});

/**
 * POST /api/tasks
 * Create new task
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const result = createTaskSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: result.error.errors,
      });
    }

    const task = await createTask(result.data as any, (req.user as any).id);

    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create task', message: error.message });
  }
});

/**
 * PUT /api/tasks/:id
 * Update task
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const result = updateTaskSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: result.error.errors,
      });
    }

    const task = await updateTask(req.params.id as string, result.data as any);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      success: true,
      data: task,
      message: 'Task updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update task', message: error.message });
  }
});

/**
 * DELETE /api/tasks/:id
 * Delete task
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await deleteTask(req.params.id as string);

    if (!success) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete task', message: error.message });
  }
});

export default router;
