import express from 'express';
import { z } from 'zod';
import { PrismaClient, Prisma } from '@prisma/client';
import { 
  createIssueSchema, 
  updateIssueSchema, 
  updateIssueStatusSchema, 
  createCommentSchema,
  issueQuerySchema 
} from '../utils/validation';
import { authenticateToken, requireAnyRole, requireAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all issues with filtering and pagination
router.get('/', authenticateToken, requireAnyRole, async (req: AuthRequest, res) => {
  try {
    const query = issueQuerySchema.parse(req.query);
    const { page, limit, status, priority, category, search, sortBy, sortOrder } = query;
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: Prisma.IssueWhereInput = {};
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    
    // If user is citizen, only show their issues
    if (req.user!.role === 'CITIZEN') {
      where.reporterId = req.user!.id;
    }
    
    // Search functionality
    if (search) {
      // --- FIX: Removed `mode: 'insensitive'` which is not supported by Prisma on MySQL ---
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
        { id: { contains: search } },
      ];
    }
    
    // Get issues with pagination
    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          attachments: {
            select: {
              id: true,
              filename: true,
              originalName: true,
              mimeType: true,
              type: true,
              url: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      }),
      prisma.issue.count({ where }),
    ]);
    
    return res.json({
      issues,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    
    console.error('Get issues error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single issue by ID
router.get('/:id', authenticateToken, requireAnyRole, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attachments: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            mimeType: true,
            type: true,
            url: true,
            size: true,
            createdAt: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        statusHistory: {
          include: {
            changedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    // Check if citizen can access this issue
    if (req.user!.role === 'CITIZEN' && issue.reporterId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    return res.json({ issue });
  } catch (error) {
    console.error('Get issue error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new issue
router.post('/', authenticateToken, requireAnyRole, async (req: AuthRequest, res) => {
  try {
    const validatedData = createIssueSchema.parse(req.body);
    
    const issue = await prisma.issue.create({
      data: {
        ...validatedData,
        reporterId: req.user!.id,
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attachments: true,
      },
    });
    
    // Create initial status history entry
    await prisma.issueStatusHistory.create({
      data: {
        issueId: issue.id,
        status: issue.status,
        changedById: req.user!.id,
        comment: 'Issue created',
      },
    });
    
    return res.status(201).json({
      message: 'Issue created successfully',
      issue,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    
    console.error('Create issue error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update issue
router.put('/:id', authenticateToken, requireAnyRole, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateIssueSchema.parse(req.body);
    
    const existingIssue = await prisma.issue.findUnique({
      where: { id },
    });
    
    if (!existingIssue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    if (req.user!.role === 'CITIZEN' && existingIssue.reporterId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    let updateData = validatedData;

    if (req.user!.role === 'CITIZEN') {
      const allowedFields = ['title', 'description', 'location', 'latitude', 'longitude'];
      const citizenUpdateData = Object.fromEntries(
        Object.entries(validatedData).filter(([key]) => allowedFields.includes(key))
      );
      
      if (Object.keys(citizenUpdateData).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }
      updateData = citizenUpdateData;
    }
    
    const updatedIssue = await prisma.issue.update({
      where: { id },
      data: updateData,
      include: {
        reporter: {
          select: { id: true, name: true, email: true },
        },
        assignee: {
          select: { id: true, name: true, email: true },
        },
        attachments: true,
      },
    });
    
    return res.json({
      message: 'Issue updated successfully',
      issue: updatedIssue,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    
    console.error('Update issue error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update issue status (Admin only)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateIssueStatusSchema.parse(req.body);
    
    const issue = await prisma.issue.findUnique({
      where: { id },
    });
    
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    const updatedIssue = await prisma.issue.update({
      where: { id },
      data: {
        status: validatedData.status,
        ...(validatedData.status === 'RESOLVED' && { resolvedAt: new Date() }),
      },
    });
    
    await prisma.issueStatusHistory.create({
      data: {
        issueId: id,
        status: validatedData.status,
        changedById: req.user!.id,
        comment: validatedData.comment || `Status changed to ${validatedData.status}`,
      },
    });
    
    return res.json({
      message: 'Issue status updated successfully',
      issue: updatedIssue,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    
    console.error('Update issue status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Assign issue to user (Admin only)
router.patch('/:id/assign', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { assigneeId } = req.body;
    
    if (!assigneeId) {
      return res.status(400).json({ error: 'Assignee ID is required' });
    }
    
    const assignee = await prisma.user.findUnique({
      where: { id: assigneeId },
    });
    
    if (!assignee) {
      return res.status(404).json({ error: 'Assignee not found' });
    }
    
    const issue = await prisma.issue.findUnique({
      where: { id },
    });
    
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    const updatedIssue = await prisma.issue.update({
      where: { id },
      data: {
        assigneeId,
        status: 'ASSIGNED',
      },
    });
    
    await prisma.issueStatusHistory.create({
      data: {
        issueId: id,
        status: 'ASSIGNED',
        changedById: req.user!.id,
        comment: `Assigned to ${assignee.name || assignee.email}`,
      },
    });
    
    return res.json({
      message: 'Issue assigned successfully',
      issue: updatedIssue,
    });
  } catch (error) {
    console.error('Assign issue error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Add comment to issue
router.post('/:id/comments', authenticateToken, requireAnyRole, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const validatedData = createCommentSchema.parse(req.body);
    
    const issue = await prisma.issue.findUnique({
      where: { id },
    });
    
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    if (validatedData.isInternal && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can create internal comments' });
    }
    
    const comment = await prisma.issueComment.create({
      data: {
        issueId: id,
        authorId: req.user!.id,
        content: validatedData.content,
        isInternal: validatedData.isInternal,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
    
    return res.status(201).json({
      message: 'Comment added successfully',
      comment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    
    console.error('Add comment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete issue (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const issue = await prisma.issue.findUnique({
      where: { id },
    });
    
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    await prisma.issue.delete({
      where: { id },
    });
    
    return res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Delete issue error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
