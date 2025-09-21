import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  return res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple auth endpoints for testing
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  
  // Simple mock authentication
  if (email && password && role) {
    return res.json({
      message: 'Login successful',
      user: {
        id: '1',
        email,
        name: email.split('@')[0],
        role: role.toUpperCase(),
      },
      token: 'mock-token-' + Date.now(),
    });
  }
  
  return res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/api/auth/me', (req, res) => {
  return res.json({
    user: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'CITIZEN',
    }
  });
});

// Simple issues endpoint
app.get('/api/issues', (req, res) => {
  return res.json({
    issues: [
      {
        id: 'CR-2024-001',
        title: 'Test Issue',
        description: 'This is a test issue',
        category: 'POTHOLE',
        priority: 'MEDIUM',
        status: 'SUBMITTED',
        severity: 3,
        location: 'Test Location',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reporter: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
        },
        attachments: [],
        comments: [],
        statusHistory: [],
      }
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      pages: 1,
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  return res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  return res.status(500).json({ 
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
