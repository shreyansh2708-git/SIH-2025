import express from 'express';
import { z } from 'zod';
import { PrismaClient, Prisma } from '@prisma/client';
import { analyticsQuerySchema } from '../utils/validation';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Helper to create date filter based on query params
const getDateFilter = (query: z.infer<typeof analyticsQuerySchema>): Prisma.IssueWhereInput => {
  const { period, startDate, endDate } = query;
  if (startDate && endDate) {
    return { createdAt: { gte: new Date(startDate), lte: new Date(endDate) } };
  }
  const days = period === '7days' ? 7 : period === '30days' ? 30 : period === '90days' ? 90 : 365;
  const calculatedStartDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return { createdAt: { gte: calculatedStartDate } };
};

router.get('/overview', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [totalIssues, openIssues, resolvedIssuesLast60Days] = await Promise.all([
      prisma.issue.count(),
      prisma.issue.count({
        where: { status: { in: ['SUBMITTED', 'ACKNOWLEDGED', 'ASSIGNED', 'IN_PROGRESS'] } },
      }),
      prisma.issue.findMany({
        where: { status: 'RESOLVED', resolvedAt: { gte: sixtyDaysAgo } },
        select: { createdAt: true, resolvedAt: true },
      }),
    ]);

    const resolvedThisMonthIssues = resolvedIssuesLast60Days.filter(
      issue => issue.resolvedAt! >= thirtyDaysAgo
    );
    const lastMonthResolvedCount = resolvedIssuesLast60Days.length - resolvedThisMonthIssues.length;

    const resolutionTimes = resolvedThisMonthIssues.map(
      issue => (issue.resolvedAt!.getTime() - issue.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const avgResolutionTimeDays = resolutionTimes.length > 0
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
      : 0;

    const resolvedChange = lastMonthResolvedCount > 0
      ? ((resolvedThisMonthIssues.length - lastMonthResolvedCount) / lastMonthResolvedCount) * 100
      : (resolvedThisMonthIssues.length > 0 ? 100 : 0);

    return res.json({
      stats: {
        totalIssues,
        openIssues,
        resolvedThisMonth: resolvedThisMonthIssues.length,
        avgResolutionTime: Math.round(avgResolutionTimeDays * 10) / 10,
        resolvedChange: Math.round(resolvedChange * 10) / 10,
        openChange: 0,
      },
    });
  } catch (error) {
    console.error('Get overview stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/categories', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const query = analyticsQuerySchema.parse(req.query);
    const dateFilter = getDateFilter(query);

    const categoryStats = await prisma.issue.groupBy({
      by: ['category'],
      where: dateFilter,
      _count: {
        id: true,
      },
    });

    const categories = categoryStats.map(stat => ({
      category: stat.category.replace(/_/g, ' '),
      count: stat._count.id,
    }));

    return res.json({ categories });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Get category stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/status', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const query = analyticsQuerySchema.parse(req.query);
    const dateFilter = getDateFilter(query);

    const statusStats = await prisma.issue.groupBy({
      by: ['status'],
      where: dateFilter,
      _count: {
        id: true,
      },
    });

    const statuses = statusStats.map(stat => ({
      status: stat.status.replace(/_/g, ' '),
      count: stat._count.id,
    }));

    return res.json({ statuses });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Get status stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/trends', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const query = analyticsQuerySchema.parse(req.query);
    const dateFilter = getDateFilter(query);
    const startDateForQuery = (dateFilter.createdAt as Prisma.DateTimeFilter).gte;

    const issues = await prisma.issue.findMany({
      where: { createdAt: { gte: startDateForQuery } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    
    // Process in JS to be DB-agnostic (avoids DATE_TRUNC issues)
    const trendsMap = new Map<string, number>();
    issues.forEach(issue => {
      const month = issue.createdAt.toISOString().substring(0, 7); // YYYY-MM
      trendsMap.set(month, (trendsMap.get(month) || 0) + 1);
    });

    const formattedTrends = Array.from(trendsMap.entries()).map(([month, count]) => ({
      month,
      count,
    }));

    return res.json({ trends: formattedTrends });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Get trends error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/recent', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const recentIssues = await prisma.issue.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                reporter: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                assignee: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
        return res.json({ recentIssues });
    } catch (error) {
        console.error('Get recent issues error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
