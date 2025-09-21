"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsQuerySchema = exports.issueQuerySchema = exports.createCommentSchema = exports.updateIssueStatusSchema = exports.updateIssueSchema = exports.createIssueSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters').optional(),
    role: zod_1.z.enum(['CITIZEN', 'ADMIN']).default('CITIZEN'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
    role: zod_1.z.enum(['CITIZEN', 'ADMIN']),
});
exports.createIssueSchema = zod_1.z.object({
    title: zod_1.z.string().min(5, 'Title must be at least 5 characters'),
    description: zod_1.z.string().min(10, 'Description must be at least 10 characters'),
    category: zod_1.z.enum([
        'POTHOLE',
        'GARBAGE_COLLECTION',
        'STREET_LIGHT',
        'SEWER_ISSUE',
        'ROAD_MAINTENANCE',
        'PUBLIC_SAFETY',
        'PARKS_RECREATION',
        'TRAFFIC_SIGNAL',
        'OTHER'
    ]),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
    severity: zod_1.z.number().min(1).max(5).default(3),
    location: zod_1.z.string().min(5, 'Location must be at least 5 characters'),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
});
exports.updateIssueSchema = zod_1.z.object({
    title: zod_1.z.string().min(5, 'Title must be at least 5 characters').optional(),
    description: zod_1.z.string().min(10, 'Description must be at least 10 characters').optional(),
    category: zod_1.z.enum([
        'POTHOLE',
        'GARBAGE_COLLECTION',
        'STREET_LIGHT',
        'SEWER_ISSUE',
        'ROAD_MAINTENANCE',
        'PUBLIC_SAFETY',
        'PARKS_RECREATION',
        'TRAFFIC_SIGNAL',
        'OTHER'
    ]).optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    severity: zod_1.z.number().min(1).max(5).optional(),
    location: zod_1.z.string().min(5, 'Location must be at least 5 characters').optional(),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
    status: zod_1.z.enum([
        'SUBMITTED',
        'ACKNOWLEDGED',
        'ASSIGNED',
        'IN_PROGRESS',
        'RESOLVED',
        'CLOSED'
    ]).optional(),
    assigneeId: zod_1.z.string().optional(),
});
exports.updateIssueStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        'SUBMITTED',
        'ACKNOWLEDGED',
        'ASSIGNED',
        'IN_PROGRESS',
        'RESOLVED',
        'CLOSED'
    ]),
    comment: zod_1.z.string().optional(),
});
exports.createCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Comment cannot be empty'),
    isInternal: zod_1.z.boolean().default(false),
});
exports.issueQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1)).default('1'),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1).max(100)).default('10'),
    status: zod_1.z.enum([
        'SUBMITTED',
        'ACKNOWLEDGED',
        'ASSIGNED',
        'IN_PROGRESS',
        'RESOLVED',
        'CLOSED'
    ]).optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    category: zod_1.z.enum([
        'POTHOLE',
        'GARBAGE_COLLECTION',
        'STREET_LIGHT',
        'SEWER_ISSUE',
        'ROAD_MAINTENANCE',
        'PUBLIC_SAFETY',
        'PARKS_RECREATION',
        'TRAFFIC_SIGNAL',
        'OTHER'
    ]).optional(),
    search: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['createdAt', 'updatedAt', 'priority', 'status']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
exports.analyticsQuerySchema = zod_1.z.object({
    period: zod_1.z.enum(['7days', '30days', '90days', '1year']).default('30days'),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
//# sourceMappingURL=validation.js.map