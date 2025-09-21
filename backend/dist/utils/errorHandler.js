"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.handlePrismaError = exports.AppError = void 0;
const client_1 = require("@prisma/client");
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const handlePrismaError = (error) => {
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                return new AppError('A record with this information already exists', 400);
            case 'P2025':
                return new AppError('Record not found', 404);
            case 'P2003':
                return new AppError('Foreign key constraint failed', 400);
            default:
                return new AppError('Database operation failed', 500);
        }
    }
    if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        return new AppError('Invalid data provided', 400);
    }
    return new AppError('An unexpected error occurred', 500);
};
exports.handlePrismaError = handlePrismaError;
const errorHandler = (error, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal server error';
    if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
    }
    else if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        const prismaError = (0, exports.handlePrismaError)(error);
        statusCode = prismaError.statusCode;
        message = prismaError.message;
    }
    else if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation error';
    }
    else if (error.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized';
    }
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', error);
    }
    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map