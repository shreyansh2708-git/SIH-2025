# Civic Connect Backend

A comprehensive backend API for the Civic Connect platform - a civic issue reporting and management system.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (Citizen/Admin)
- **Issue Management**: Full CRUD operations for civic issues with status tracking
- **File Upload**: Support for images and voice notes with automatic optimization
- **Analytics Dashboard**: Comprehensive reporting and analytics for administrators
- **Real-time Updates**: Status history and comment system
- **Database**: PostgreSQL with Prisma ORM
- **Security**: Rate limiting, CORS, input validation, and secure file handling

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **File Processing**: Sharp (image optimization)
- **Validation**: Zod
- **Security**: Helmet, bcryptjs, express-rate-limit

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

### Issues
- `GET /api/issues` - Get all issues (with filtering/pagination)
- `GET /api/issues/:id` - Get single issue
- `POST /api/issues` - Create new issue
- `PUT /api/issues/:id` - Update issue
- `PATCH /api/issues/:id/status` - Update issue status (Admin)
- `PATCH /api/issues/:id/assign` - Assign issue (Admin)
- `POST /api/issues/:id/comments` - Add comment
- `DELETE /api/issues/:id` - Delete issue (Admin)

### File Upload
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `DELETE /api/upload/:attachmentId` - Delete attachment

### Analytics (Admin only)
- `GET /api/analytics/overview` - Dashboard overview stats
- `GET /api/analytics/categories` - Issues by category
- `GET /api/analytics/status` - Issues by status
- `GET /api/analytics/priority` - Issues by priority
- `GET /api/analytics/trends` - Monthly volume trends
- `GET /api/analytics/performance` - Performance metrics
- `GET /api/analytics/recent` - Recent issues

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/:id/stats` - Get user statistics

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/civic_connect"
   JWT_SECRET="your-super-secret-jwt-key-here"
   JWT_EXPIRES_IN="7d"
   PORT=3001
   NODE_ENV="development"
   UPLOAD_DIR="./uploads"
   MAX_FILE_SIZE=10485760
   FRONTEND_URL="http://localhost:5173"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run generate
   
   # Run database migrations
   npm run migrate
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## Database Schema

### Core Models
- **User**: Citizens and administrators
- **Issue**: Civic issues with full lifecycle tracking
- **IssueAttachment**: File attachments (images, audio)
- **IssueComment**: Comments and internal notes
- **IssueStatusHistory**: Complete audit trail
- **AnalyticsSnapshot**: Pre-computed analytics data

### Database Provider
- **MySQL**: Primary database with Prisma ORM
- **JSON Support**: For analytics snapshots and flexible data storage

### Key Features
- Role-based access control
- Comprehensive issue tracking
- File upload with optimization
- Audit trail for all changes
- Analytics and reporting

## Security Features

- JWT-based authentication
- Role-based authorization
- Rate limiting (100 requests per 15 minutes)
- Input validation with Zod
- File type and size restrictions
- CORS protection
- Helmet security headers
- Password hashing with bcrypt

## File Upload

- Supports images (JPEG, PNG, WebP) and audio files
- Automatic image optimization and resizing
- Secure file storage with unique naming
- File type validation
- Size limits (configurable, default 10MB)

## Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run generate` - Generate Prisma client
- `npm run studio` - Open Prisma Studio

### Code Structure
```
src/
├── routes/          # API route handlers
├── middleware/      # Express middleware
├── utils/          # Utility functions
├── server.ts       # Main server file
└── prisma/         # Database schema and migrations
```

## API Documentation

The API follows RESTful conventions with comprehensive error handling and validation. All endpoints return JSON responses with appropriate HTTP status codes.

### Authentication
Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Error Responses
All errors follow a consistent format:
```json
{
  "error": "Error message",
  "details": "Additional error details (if applicable)"
}
```

## Contributing

1. Follow TypeScript best practices
2. Use Prisma for all database operations
3. Implement proper error handling
4. Add input validation with Zod
5. Write comprehensive API documentation
6. Test all endpoints thoroughly

## License

MIT License - see LICENSE file for details
