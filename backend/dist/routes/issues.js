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
router.get('/', auth_1.authenticateToken, auth_1.requireAnyRole, async (req, res) => {
    try {
        const query = validation_1.issueQuerySchema.parse(req.query);
        const { page, limit, status, priority, category, search, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        if (priority)
            where.priority = priority;
        if (category)
            where.category = category;
        if (req.user.role === 'CITIZEN') {
            where.reporterId = req.user.id;
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } },
                { id: { contains: search, mode: 'insensitive' } },
            ];
        }
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
        res.json({
            issues,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.errors,
            });
        }
        console.error('Get issues error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/:id', auth_1.authenticateToken, auth_1.requireAnyRole, async (req, res) => {
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
        if (req.user.role === 'CITIZEN' && issue.reporterId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json({ issue });
    }
    catch (error) {
        console.error('Get issue error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/', auth_1.authenticateToken, auth_1.requireAnyRole, async (req, res) => {
    try {
        const validatedData = validation_1.createIssueSchema.parse(req.body);
        const issue = await prisma.issue.create({
            data: {
                ...validatedData,
                reporterId: req.user.id,
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
        await prisma.issueStatusHistory.create({
            data: {
                issueId: issue.id,
                status: issue.status,
                changedById: req.user.id,
                comment: 'Issue created',
            },
        });
        res.status(201).json({
            message: 'Issue created successfully',
            issue,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.errors,
            });
        }
        console.error('Create issue error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/:id', auth_1.authenticateToken, auth_1.requireAnyRole, async (req, res) => {
    try {
        const { id } = req.params;
        const validatedData = validation_1.updateIssueSchema.parse(req.body);
        const existingIssue = await prisma.issue.findUnique({
            where: { id },
        });
        if (!existingIssue) {
            return res.status(404).json({ error: 'Issue not found' });
        }
        if (req.user.role === 'CITIZEN' && existingIssue.reporterId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        if (req.user.role === 'CITIZEN') {
            const allowedFields = ['title', 'description', 'location', 'latitude', 'longitude'];
            const citizenUpdateData = Object.fromEntries(Object.entries(validatedData).filter(([key]) => allowedFields.includes(key)));
            if (Object.keys(citizenUpdateData).length === 0) {
                return res.status(400).json({ error: 'No valid fields to update' });
            }
            validatedData = citizenUpdateData;
        }
        const updatedIssue = await prisma.issue.update({
            where: { id },
            data: validatedData,
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
                attachments: true,
            },
        });
        res.json({
            message: 'Issue updated successfully',
            issue: updatedIssue,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.errors,
            });
        }
        console.error('Update issue error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.patch('/:id/status', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const validatedData = validation_1.updateIssueStatusSchema.parse(req.body);
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
                changedById: req.user.id,
                comment: validatedData.comment || `Status changed to ${validatedData.status}`,
            },
        });
        res.json({
            message: 'Issue status updated successfully',
            issue: updatedIssue,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.errors,
            });
        }
        console.error('Update issue status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.patch('/:id/assign', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
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
                changedById: req.user.id,
                comment: `Assigned to ${assignee.name || assignee.email}`,
            },
        });
        res.json({
            message: 'Issue assigned successfully',
            issue: updatedIssue,
        });
    }
    catch (error) {
        console.error('Assign issue error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/:id/comments', auth_1.authenticateToken, auth_1.requireAnyRole, async (req, res) => {
    try {
        const { id } = req.params;
        const validatedData = validation_1.createCommentSchema.parse(req.body);
        const issue = await prisma.issue.findUnique({
            where: { id },
        });
        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }
        if (validatedData.isInternal && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Only admins can create internal comments' });
        }
        const comment = await prisma.issueComment.create({
            data: {
                issueId: id,
                authorId: req.user.id,
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
        res.status(201).json({
            message: 'Comment added successfully',
            comment,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.errors,
            });
        }
        console.error('Add comment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
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
        res.json({ message: 'Issue deleted successfully' });
    }
    catch (error) {
        console.error('Delete issue error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=issues.js.map