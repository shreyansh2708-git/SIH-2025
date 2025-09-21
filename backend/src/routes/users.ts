import express from 'express';
import { PrismaClient, Prisma, UserRole } from '@prisma/client';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all users (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: Prisma.UserWhereInput = {};
    
    if (role) {
      where.role = role as UserRole;
    }
    
    if (search) {
      // --- FIX: Removed `mode: 'insensitive'` which is not supported by Prisma on MySQL ---
      where.OR = [
        { name: { contains: search as string } },
        { email: { contains: search as string } },
      ];
    }
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              reportedIssues: true,
              assignedIssues: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);
    
    return res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID (Admin only)
router.get('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        reportedIssues: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        assignedIssues: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            reportedIssues: true,
            assignedIssues: true,
          },
        },
      },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (email && email !== existingUser.email) {
      const emailTaken = await prisma.user.findFirst({
        where: {
          email,
          id: { not: id },
        },
      });
      
      if (emailTaken) {
        return res.status(400).json({ error: 'Email already taken' });
      }
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });
    
    return res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const issueCount = await prisma.issue.count({
      where: {
        OR: [
          { reporterId: id },
          { assigneeId: id },
        ],
      },
    });
    
    if (issueCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete user with associated issues',
        issueCount,
      });
    }
    
    await prisma.user.delete({
      where: { id },
    });
    
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user statistics (Admin only)
router.get('/:id/stats', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const [
      totalReported,
      totalAssigned,
      reportedThisMonth,
      assignedThisMonth,
      resolvedAsReporter,
      resolvedAsAssignee,
    ] = await Promise.all([
      prisma.issue.count({
        where: { reporterId: id },
      }),
      prisma.issue.count({
        where: { assigneeId: id },
      }),
      prisma.issue.count({
        where: {
          reporterId: id,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.issue.count({
        where: {
          assigneeId: id,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.issue.count({
        where: {
          reporterId: id,
          status: 'RESOLVED',
        },
      }),
      prisma.issue.count({
        where: {
          assigneeId: id,
          status: 'RESOLVED',
        },
      }),
    ]);
    
    return res.json({
      stats: {
        totalReported,
        totalAssigned,
        reportedThisMonth,
        assignedThisMonth,
        resolvedAsReporter,
        resolvedAsAssignee,
      },
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;