import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { 
  listUsers, 
  findUserById, 
  createUser, 
  updateUser, 
  softDeleteUser 
} from '../services/userService';
import { createUserSchema, updateUserSchema } from '../utils/validation';
import type { Request, Response } from 'express';

const router = Router();

// All routes require admin role
router.use(requireAuth);
router.use(requireRole(['admin']));

/**
 * GET /api/users
 * List all users with pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await listUsers(limit, offset);

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
    res.status(500).json({ error: 'Failed to fetch users', message: error.message });
  }
});

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await findUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch user', message: error.message });
  }
});

/**
 * POST /api/users
 * Create new user
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validate input
    const result = createUserSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: result.error.errors,
      });
    }

    const user = await createUser(result.data);

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully',
    });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create user', message: error.message });
  }
});

/**
 * PUT /api/users/:id
 * Update user
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    // Validate input
    const result = updateUserSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: result.error.errors,
      });
    }

    const user = await updateUser(req.params.id, result.data);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update user', message: error.message });
  }
});

/**
 * DELETE /api/users/:id
 * Soft delete user
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await softDeleteUser(req.params.id);

    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete user', message: error.message });
  }
});

export default router;
