import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  role: z.enum(['CITIZEN', 'ADMIN']).default('CITIZEN'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['CITIZEN', 'ADMIN']),
});

// Issue validation schemas
export const createIssueSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum([
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
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  severity: z.number().min(1).max(5).default(3),
  location: z.string().min(5, 'Location must be at least 5 characters'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const updateIssueSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  category: z.enum([
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
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  severity: z.number().min(1).max(5).optional(),
  location: z.string().min(5, 'Location must be at least 5 characters').optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  status: z.enum([
    'SUBMITTED',
    'ACKNOWLEDGED',
    'ASSIGNED',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
  ]).optional(),
  assigneeId: z.string().optional(),
});

export const updateIssueStatusSchema = z.object({
  status: z.enum([
    'SUBMITTED',
    'ACKNOWLEDGED',
    'ASSIGNED',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
  ]),
  comment: z.string().optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
  isInternal: z.boolean().default(false),
});

// Query parameter validation
export const issueQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  status: z.enum([
    'SUBMITTED',
    'ACKNOWLEDGED',
    'ASSIGNED',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
  ]).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  category: z.enum([
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
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const analyticsQuerySchema = z.object({
  period: z.enum(['7days', '30days', '90days', '1year']).default('30days'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});
