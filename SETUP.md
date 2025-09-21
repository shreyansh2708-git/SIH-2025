# Civic Connect - Complete Setup Guide

This guide will help you set up both the frontend and backend for the Civic Connect platform.

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp env.example .env
```

Edit the `.env` file with your configuration:
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

**Important**: Make sure your MySQL server is running and you have created the `civic_connect` database:
```sql
CREATE DATABASE civic_connect;
```

### 4. Database Setup
```bash
# Generate Prisma client
npm run generate

# Run database migrations
npm run migrate

# Set up sample data
npm run setup
```

### 5. Start Backend Server
```bash
npm run dev
```

The backend API will be available at `http://localhost:3001`

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd ..  # Go back to root directory
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3001/api
```

### 4. Start Frontend Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Default Credentials

After running the backend setup, you can use these credentials:

### Admin Account
- Email: `admin@civic.gov`
- Password: `admin123`
- Role: Admin

### Citizen Account
- Email: `citizen@example.com`
- Password: `citizen123`
- Role: Citizen

## Features Overview

### For Citizens
- **Report Issues**: Submit civic issues with photos, voice notes, and location
- **Track Issues**: View status of reported issues with progress timeline
- **Profile Management**: Update personal information and change password

### For Administrators
- **Dashboard Overview**: View statistics and recent issues
- **Issue Management**: View, filter, and manage all reported issues
- **Status Updates**: Update issue status and assign to team members
- **Analytics**: Comprehensive reporting and analytics
- **User Management**: Manage citizen and admin accounts

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile
- `PUT /api/auth/change-password` - Change password

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

## Database Schema

The application uses MySQL with the following main entities:

- **Users**: Citizens and administrators
- **Issues**: Civic issues with full lifecycle tracking
- **IssueAttachments**: File attachments (images, audio)
- **IssueComments**: Comments and internal notes
- **IssueStatusHistory**: Complete audit trail
- **AnalyticsSnapshot**: Pre-computed analytics data

## Development

### Backend Development
```bash
cd backend
npm run dev  # Start with hot reload
npm run build  # Build for production
npm run studio  # Open Prisma Studio
```

### Frontend Development
```bash
npm run dev  # Start with hot reload
npm run build  # Build for production
npm run preview  # Preview production build
```

## Production Deployment

### Backend
1. Build the application: `npm run build`
2. Start production server: `npm start`
3. Ensure MySQL is running
4. Set up environment variables for production

### Frontend
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Update `VITE_API_URL` to point to your production backend

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Check DATABASE_URL in .env file
   - Make sure the `civic_connect` database exists
   - Run `npm run migrate` to create tables

2. **CORS Errors**
   - Check FRONTEND_URL in backend .env file
   - Ensure frontend is running on the correct port

3. **File Upload Issues**
   - Check UPLOAD_DIR exists and is writable
   - Verify MAX_FILE_SIZE setting

4. **Authentication Issues**
   - Check JWT_SECRET is set
   - Clear browser localStorage and try again

### Logs
- Backend logs are displayed in the terminal
- Frontend errors are shown in browser console
- Database queries can be viewed in Prisma Studio

## Support

For issues or questions:
1. Check the logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check that both frontend and backend are running

## License

MIT License - see LICENSE file for details
