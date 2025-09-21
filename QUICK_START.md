# 🚀 Quick Start Guide - Civic Connect

This guide will get your Civic Connect application running in the simplest way possible.

## ⚡ Super Quick Start (5 minutes)

### Step 1: Start Simple Backend
```bash
cd backend
npm install
npm run simple
```

This starts a simple backend server with mock data - no database required!

### Step 2: Start Frontend
```bash
# Open new terminal
cd ..  # Go to root directory
npm install
echo "VITE_API_URL=http://localhost:3001/api" > .env
npm run dev
```

### Step 3: Test the Application
1. Open [http://localhost:5173](http://localhost:5173)
2. Try logging in with any email/password
3. You should see the dashboard with sample data

## 🔧 Full Setup with MySQL (15 minutes)

### Step 1: Install MySQL
**Windows:** Download from [mysql.com](https://dev.mysql.com/downloads/installer/)
**macOS:** `brew install mysql && brew services start mysql`
**Linux:** `sudo apt install mysql-server`

### Step 2: Create Database
```sql
CREATE DATABASE civic_connect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 3: Backend Setup
```bash
cd backend
npm install
cp env.example .env
```

Edit `.env` file:
```env
DATABASE_URL="mysql://root:your_password@localhost:3306/civic_connect"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760
FRONTEND_URL="http://localhost:5173"
```

### Step 4: Database Setup
```bash
npm run generate
npm run migrate
npm run setup
```

### Step 5: Start Full Backend
```bash
npm run dev
```

### Step 6: Start Frontend
```bash
# New terminal
cd ..
npm install
echo "VITE_API_URL=http://localhost:3001/api" > .env
npm run dev
```

## 🎯 What You'll See

### Simple Mode (No Database)
- Basic login (any credentials work)
- Sample issue data
- All features work but data doesn't persist

### Full Mode (With Database)
- Real authentication
- Persistent data
- File uploads
- Complete analytics

## 🔑 Default Credentials (Full Mode)

**Admin:**
- Email: `admin@civic.gov`
- Password: `admin123`

**Citizen:**
- Email: `citizen@example.com`
- Password: `citizen123`

## 🚨 Troubleshooting

### Backend Won't Start
```bash
# Check if port 3001 is free
netstat -an | findstr :3001

# Kill process if needed
taskkill /f /im node.exe
```

### Frontend Won't Start
```bash
# Check if port 5173 is free
netstat -an | findstr :5173

# Clear cache
rm -rf node_modules
npm install
```

### Database Issues
```bash
# Check MySQL is running
mysql -u root -p

# Reset database
cd backend
npx prisma migrate reset
npm run setup
```

### CORS Errors
Make sure both servers are running:
- Backend: http://localhost:3001
- Frontend: http://localhost:5173

## 📁 Project Structure
```
civic-connect-fe/
├── backend/           # Node.js/Express API
│   ├── src/
│   │   ├── server.ts      # Full server with database
│   │   └── simple-server.ts # Simple server (no database)
│   └── package.json
├── src/               # React frontend
│   ├── pages/         # Page components
│   ├── components/    # UI components
│   └── services/      # API service
└── package.json
```

## 🎉 Success!

You should now have:
- ✅ Backend API running on port 3001
- ✅ Frontend running on port 5173
- ✅ Working login system
- ✅ Issue reporting functionality
- ✅ Admin dashboard (if using full mode)

## 🔄 Switching Between Modes

**Simple Mode (No Database):**
```bash
cd backend
npm run simple
```

**Full Mode (With Database):**
```bash
cd backend
npm run dev
```

Both modes work with the same frontend!

## 📞 Need Help?

1. Check the console for error messages
2. Verify both servers are running
3. Check the browser network tab for API errors
4. Make sure ports 3001 and 5173 are available

The simple mode is perfect for testing and development without database setup!
