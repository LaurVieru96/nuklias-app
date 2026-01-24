import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  listLeads,
  findLeadById,
  createLead,
  updateLead,
  softDeleteLead,
} from '../services/leadService';
import { createLeadSchema, updateLeadSchema, leadFiltersSchema } from '../utils/validation';
import type { Request, Response } from 'express';

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * GET /api/leads
 * List leads with filters and pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    // Parse filters
    const filters = {
      status: req.query.status ? (req.query.status as string).split(',') : undefined,
      priority: req.query.priority ? (req.query.priority as string).split(',') : undefined,
      assignedTo: req.query.assignedTo as string,
      search: req.query.search as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    const result = await listLeads(filters, limit, offset);

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
    res.status(500).json({ error: 'Failed to fetch leads', message: error.message });
  }
});

/**
 * GET /api/leads/:id
 * Get lead by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const lead = await findLeadById(req.params.id);

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ success: true, data: lead });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch lead', message: error.message });
  }
});

/**
 * POST /api/leads
 * Create new lead
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const result = createLeadSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: result.error.errors,
      });
    }

    const lead = await createLead(result.data);

    res.status(201).json({
      success: true,
      data: lead,
      message: 'Lead created successfully',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create lead', message: error.message });
  }
});

/**
 * PUT /api/leads/:id
 * Update lead
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const result = updateLeadSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: result.error.errors,
      });
    }

    const lead = await updateLead(req.params.id, result.data);

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({
      success: true,
      data: lead,
      message: 'Lead updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update lead', message: error.message });
  }
});

/**
 * DELETE /api/leads/:id
 * Soft delete lead (admin only)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await softDeleteLead(req.params.id);

    if (!success) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete lead', message: error.message });
  }
});

export default router;
