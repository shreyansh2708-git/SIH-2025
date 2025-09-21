import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    role: z.ZodDefault<z.ZodEnum<["CITIZEN", "ADMIN"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    role: "CITIZEN" | "ADMIN";
    name?: string | undefined;
}, {
    email: string;
    password: string;
    name?: string | undefined;
    role?: "CITIZEN" | "ADMIN" | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodEnum<["CITIZEN", "ADMIN"]>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    role: "CITIZEN" | "ADMIN";
}, {
    email: string;
    password: string;
    role: "CITIZEN" | "ADMIN";
}>;
export declare const createIssueSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    category: z.ZodEnum<["POTHOLE", "GARBAGE_COLLECTION", "STREET_LIGHT", "SEWER_ISSUE", "ROAD_MAINTENANCE", "PUBLIC_SAFETY", "PARKS_RECREATION", "TRAFFIC_SIGNAL", "OTHER"]>;
    priority: z.ZodDefault<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "CRITICAL"]>>;
    severity: z.ZodDefault<z.ZodNumber>;
    location: z.ZodString;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
    category: "POTHOLE" | "GARBAGE_COLLECTION" | "STREET_LIGHT" | "SEWER_ISSUE" | "ROAD_MAINTENANCE" | "PUBLIC_SAFETY" | "PARKS_RECREATION" | "TRAFFIC_SIGNAL" | "OTHER";
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    severity: number;
    location: string;
    latitude?: number | undefined;
    longitude?: number | undefined;
}, {
    title: string;
    description: string;
    category: "POTHOLE" | "GARBAGE_COLLECTION" | "STREET_LIGHT" | "SEWER_ISSUE" | "ROAD_MAINTENANCE" | "PUBLIC_SAFETY" | "PARKS_RECREATION" | "TRAFFIC_SIGNAL" | "OTHER";
    location: string;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | undefined;
    severity?: number | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
}>;
export declare const updateIssueSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<["POTHOLE", "GARBAGE_COLLECTION", "STREET_LIGHT", "SEWER_ISSUE", "ROAD_MAINTENANCE", "PUBLIC_SAFETY", "PARKS_RECREATION", "TRAFFIC_SIGNAL", "OTHER"]>>;
    priority: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "CRITICAL"]>>;
    severity: z.ZodOptional<z.ZodNumber>;
    location: z.ZodOptional<z.ZodString>;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<["SUBMITTED", "ACKNOWLEDGED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"]>>;
    assigneeId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "SUBMITTED" | "ACKNOWLEDGED" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | undefined;
    title?: string | undefined;
    description?: string | undefined;
    category?: "POTHOLE" | "GARBAGE_COLLECTION" | "STREET_LIGHT" | "SEWER_ISSUE" | "ROAD_MAINTENANCE" | "PUBLIC_SAFETY" | "PARKS_RECREATION" | "TRAFFIC_SIGNAL" | "OTHER" | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | undefined;
    severity?: number | undefined;
    location?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    assigneeId?: string | undefined;
}, {
    status?: "SUBMITTED" | "ACKNOWLEDGED" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | undefined;
    title?: string | undefined;
    description?: string | undefined;
    category?: "POTHOLE" | "GARBAGE_COLLECTION" | "STREET_LIGHT" | "SEWER_ISSUE" | "ROAD_MAINTENANCE" | "PUBLIC_SAFETY" | "PARKS_RECREATION" | "TRAFFIC_SIGNAL" | "OTHER" | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | undefined;
    severity?: number | undefined;
    location?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    assigneeId?: string | undefined;
}>;
export declare const updateIssueStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["SUBMITTED", "ACKNOWLEDGED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"]>;
    comment: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "SUBMITTED" | "ACKNOWLEDGED" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    comment?: string | undefined;
}, {
    status: "SUBMITTED" | "ACKNOWLEDGED" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    comment?: string | undefined;
}>;
export declare const createCommentSchema: z.ZodObject<{
    content: z.ZodString;
    isInternal: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    content: string;
    isInternal: boolean;
}, {
    content: string;
    isInternal?: boolean | undefined;
}>;
export declare const issueQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    status: z.ZodOptional<z.ZodEnum<["SUBMITTED", "ACKNOWLEDGED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"]>>;
    priority: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "CRITICAL"]>>;
    category: z.ZodOptional<z.ZodEnum<["POTHOLE", "GARBAGE_COLLECTION", "STREET_LIGHT", "SEWER_ISSUE", "ROAD_MAINTENANCE", "PUBLIC_SAFETY", "PARKS_RECREATION", "TRAFFIC_SIGNAL", "OTHER"]>>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "updatedAt", "priority", "status"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "status" | "priority" | "createdAt" | "updatedAt";
    sortOrder: "asc" | "desc";
    status?: "SUBMITTED" | "ACKNOWLEDGED" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | undefined;
    category?: "POTHOLE" | "GARBAGE_COLLECTION" | "STREET_LIGHT" | "SEWER_ISSUE" | "ROAD_MAINTENANCE" | "PUBLIC_SAFETY" | "PARKS_RECREATION" | "TRAFFIC_SIGNAL" | "OTHER" | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | undefined;
    search?: string | undefined;
}, {
    status?: "SUBMITTED" | "ACKNOWLEDGED" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | undefined;
    category?: "POTHOLE" | "GARBAGE_COLLECTION" | "STREET_LIGHT" | "SEWER_ISSUE" | "ROAD_MAINTENANCE" | "PUBLIC_SAFETY" | "PARKS_RECREATION" | "TRAFFIC_SIGNAL" | "OTHER" | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | undefined;
    page?: string | undefined;
    limit?: string | undefined;
    search?: string | undefined;
    sortBy?: "status" | "priority" | "createdAt" | "updatedAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const analyticsQuerySchema: z.ZodObject<{
    period: z.ZodDefault<z.ZodEnum<["7days", "30days", "90days", "1year"]>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    period: "7days" | "30days" | "90days" | "1year";
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    period?: "7days" | "30days" | "90days" | "1year" | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
//# sourceMappingURL=validation.d.ts.map