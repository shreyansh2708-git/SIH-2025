"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const validation_1 = require("../utils/validation");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.get('/overview', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const lastMonth = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        const [totalIssues, openIssues, resolvedThisMonth, avgResolutionTime, lastMonthResolved,] = await Promise.all([
            prisma.issue.count(),
            prisma.issue.count({
                where: {
                    status: {
                        in: ['SUBMITTED', 'ACKNOWLEDGED', 'ASSIGNED', 'IN_PROGRESS'],
                    },
                },
            }),
            prisma.issue.count({
                where: {
                    status: 'RESOLVED',
                    resolvedAt: {
                        gte: thirtyDaysAgo,
                    },
                },
            }),
            prisma.issue.aggregate({
                where: {
                    status: 'RESOLVED',
                    resolvedAt: {
                        gte: thirtyDaysAgo,
                    },
                },
                _avg: {},
            }),
            prisma.issue.count({
                where: {
                    status: 'RESOLVED',
                    resolvedAt: {
                        gte: lastMonth,
                        lt: thirtyDaysAgo,
                    },
                },
            }),
        ]);
        const resolvedIssues = await prisma.issue.findMany({
            where: {
                status: 'RESOLVED',
                resolvedAt: {
                    gte: thirtyDaysAgo,
                },
            },
            select: {
                createdAt: true,
                resolvedAt: true,
            },
        });
        const resolutionTimes = resolvedIssues.map(issue => {
            if (issue.resolvedAt) {
                return (issue.resolvedAt.getTime() - issue.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            }
            return 0;
        });
        const avgResolutionTimeDays = resolutionTimes.length > 0
            ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
            : 0;
        const resolvedChange = lastMonthResolved > 0
            ? ((resolvedThisMonth - lastMonthResolved) / lastMonthResolved) * 100
            : 0;
        const openChange = 0;
        res.json({
            stats: {
                totalIssues,
                openIssues,
                resolvedThisMonth,
                avgResolutionTime: Math.round(avgResolutionTimeDays * 10) / 10,
                resolvedChange: Math.round(resolvedChange * 10) / 10,
                openChange: Math.round(openChange * 10) / 10,
            },
        });
    }
    catch (error) {
        console.error('Get overview stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/categories', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const query = validation_1.analyticsQuerySchema.parse(req.query);
        const { period, startDate, endDate } = query;
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            };
        }
        else {
            const days = period === '7days' ? 7 : period === '30days' ? 30 : period === '90days' ? 90 : 365;
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            dateFilter = {
                createdAt: {
                    gte: startDate,
                },
            };
        }
        const categoryStats = await prisma.issue.groupBy({
            by: ['category'],
            where: dateFilter,
            _count: {
                id: true,
            },
        });
        const total = categoryStats.reduce((sum, stat) => sum + stat._count.id, 0);
        const categories = categoryStats.map(stat => ({
            category: stat.category,
            count: stat._count.id,
            percentage: total > 0 ? Math.round((stat._count.id / total) * 100) : 0,
        }));
        res.json({ categories });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.errors,
            });
        }
        console.error('Get category stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/status', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const query = validation_1.analyticsQuerySchema.parse(req.query);
        const { period, startDate, endDate } = query;
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            };
        }
        else {
            const days = period === '7days' ? 7 : period === '30days' ? 30 : period === '90days' ? 90 : 365;
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            dateFilter = {
                createdAt: {
                    gte: startDate,
                },
            };
        }
        const statusStats = await prisma.issue.groupBy({
            by: ['status'],
            where: dateFilter,
            _count: {
                id: true,
            },
        });
        const total = statusStats.reduce((sum, stat) => sum + stat._count.id, 0);
        const statuses = statusStats.map(stat => ({
            status: stat.status,
            count: stat._count.id,
            percentage: total > 0 ? Math.round((stat._count.id / total) * 100) : 0,
        }));
        res.json({ statuses });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.errors,
            });
        }
        console.error('Get status stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/priority', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const query = validation_1.analyticsQuerySchema.parse(req.query);
        const { period, startDate, endDate } = query;
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            };
        }
        else {
            const days = period === '7days' ? 7 : period === '30days' ? 30 : period === '90days' ? 90 : 365;
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            dateFilter = {
                createdAt: {
                    gte: startDate,
                },
            };
        }
        const priorityStats = await prisma.issue.groupBy({
            by: ['priority'],
            where: dateFilter,
            _count: {
                id: true,
            },
        });
        const total = priorityStats.reduce((sum, stat) => sum + stat._count.id, 0);
        const priorities = priorityStats.map(stat => ({
            priority: stat.priority,
            count: stat._count.id,
            percentage: total > 0 ? Math.round((stat._count.id / total) * 100) : 0,
        }));
        res.json({ priorities });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.errors,
            });
        }
        console.error('Get priority stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/trends', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const query = validation_1.analyticsQuerySchema.parse(req.query);
        const { period, startDate, endDate } = query;
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            };
        }
        else {
            const days = period === '7days' ? 7 : period === '30days' ? 30 : period === '90days' ? 90 : 365;
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            dateFilter = {
                createdAt: {
                    gte: startDate,
                },
            };
        }
        const monthlyData = await prisma.$queryRaw `
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count
      FROM "issues"
      WHERE "createdAt" >= ${dateFilter.createdAt?.gte || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;
        res.json({ trends: monthlyData });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.errors,
            });
        }
        console.error('Get trends error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/performance', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const firstResponseData = await prisma.issueStatusHistory.findMany({
            where: {
                createdAt: {
                    gte: thirtyDaysAgo,
                },
                status: {
                    in: ['ACKNOWLEDGED', 'ASSIGNED'],
                },
            },
            include: {
                issue: {
                    select: {
                        createdAt: true,
                    },
                },
            },
        });
        const firstResponseTimes = firstResponseData.map(history => {
            return (history.createdAt.getTime() - history.issue.createdAt.getTime()) / (1000 * 60 * 60);
        });
        const avgFirstResponseTime = firstResponseTimes.length > 0
            ? firstResponseTimes.reduce((a, b) => a + b, 0) / firstResponseTimes.length
            : 0;
        const totalIssues = await prisma.issue.count({
            where: {
                createdAt: {
                    gte: thirtyDaysAgo,
                },
            },
        });
        const resolvedIssues = await prisma.issue.count({
            where: {
                status: 'RESOLVED',
                createdAt: {
                    gte: thirtyDaysAgo,
                },
            },
        });
        const resolutionRate = totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0;
        const slaIssues = await prisma.issue.findMany({
            where: {
                status: 'RESOLVED',
                createdAt: {
                    gte: thirtyDaysAgo,
                },
            },
            select: {
                createdAt: true,
                resolvedAt: true,
            },
        });
        const slaCompliant = slaIssues.filter(issue => {
            if (!issue.resolvedAt)
                return false;
            const resolutionTime = (issue.resolvedAt.getTime() - issue.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            return resolutionTime <= 7;
        }).length;
        const slaCompliance = slaIssues.length > 0 ? (slaCompliant / slaIssues.length) * 100 : 0;
        res.json({
            metrics: {
                firstResponseTime: Math.round(avgFirstResponseTime * 10) / 10,
                resolutionRate: Math.round(resolutionRate * 10) / 10,
                slaCompliance: Math.round(slaCompliance * 10) / 10,
                citizenSatisfaction: 4.6,
            },
        });
    }
    catch (error) {
        console.error('Get performance metrics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/recent', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
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
        res.json({ recentIssues });
    }
    catch (error) {
        console.error('Get recent issues error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=analytics.js.map