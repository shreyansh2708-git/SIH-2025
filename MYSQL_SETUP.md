# MySQL Setup Guide for Civic Connect

This guide will help you set up MySQL for the Civic Connect backend.

## Prerequisites

- MySQL Server 8.0 or higher
- MySQL client (mysql command line tool)
- Node.js and npm (for the backend)

## Step 1: Install MySQL

### On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### On macOS (using Homebrew):
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

### On Windows:
1. Download MySQL Installer from [mysql.com](https://dev.mysql.com/downloads/installer/)
2. Run the installer and follow the setup wizard
3. Choose "MySQL Server" and "MySQL Workbench" (optional)

## Step 2: Start MySQL Service

### On Ubuntu/Debian:
```bash
sudo systemctl start mysql
sudo systemctl enable mysql
```

### On macOS:
```bash
brew services start mysql
```

### On Windows:
MySQL service should start automatically after installation.

## Step 3: Create Database and User

### Option 1: Using the provided SQL script
```bash
# Navigate to the backend directory
cd backend

# Run the setup script (replace credentials as needed)
mysql -u root -p < scripts/mysql-setup.sql
```

### Option 2: Manual setup
```bash
# Connect to MySQL as root
mysql -u root -p

# Run these commands in MySQL:
CREATE DATABASE civic_connect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'civic_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON civic_connect.* TO 'civic_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Step 4: Configure Backend

1. **Copy environment file:**
   ```bash
   cd backend
   cp env.example .env
   ```

2. **Edit the .env file:**
   ```env
   DATABASE_URL="mysql://civic_user:your_secure_password@localhost:3306/civic_connect"
   JWT_SECRET="your-super-secret-jwt-key-here"
   JWT_EXPIRES_IN="7d"
   PORT=3001
   NODE_ENV="development"
   UPLOAD_DIR="./uploads"
   MAX_FILE_SIZE=10485760
   FRONTEND_URL="http://localhost:5173"
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Generate Prisma client:**
   ```bash
   npm run generate
   ```

5. **Run database migrations:**
   ```bash
   npm run migrate
   ```

6. **Set up sample data:**
   ```bash
   npm run setup
   ```

## Step 5: Verify Setup

1. **Start the backend server:**
   ```bash
   npm run dev
   ```

2. **Check the health endpoint:**
   ```bash
   curl http://localhost:3001/health
   ```

3. **Verify database connection:**
   ```bash
   mysql -u civic_user -p civic_connect -e "SHOW TABLES;"
   ```

## Troubleshooting

### Common Issues:

1. **Connection Refused:**
   - Ensure MySQL service is running
   - Check if MySQL is listening on port 3306
   - Verify firewall settings

2. **Access Denied:**
   - Check username and password in .env file
   - Ensure user has proper privileges
   - Try connecting manually: `mysql -u civic_user -p`

3. **Database Not Found:**
   - Ensure the database was created successfully
   - Check database name in connection string

4. **Prisma Migration Errors:**
   - Delete existing migrations: `rm -rf prisma/migrations`
   - Reset database: `npx prisma migrate reset`
   - Run migrations again: `npm run migrate`

### Useful MySQL Commands:

```sql
-- Check if database exists
SHOW DATABASES LIKE 'civic_connect';

-- Check user privileges
SHOW GRANTS FOR 'civic_user'@'localhost';

-- Check table structure
USE civic_connect;
SHOW TABLES;
DESCRIBE users;

-- Check data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM issues;
```

### Performance Optimization:

1. **MySQL Configuration:**
   ```sql
   -- Increase max connections
   SET GLOBAL max_connections = 200;
   
   -- Optimize for development
   SET GLOBAL innodb_buffer_pool_size = 128M;
   ```

2. **Index Optimization:**
   - Prisma will automatically create necessary indexes
   - Monitor slow queries with: `SHOW PROCESSLIST;`

## Production Considerations:

1. **Security:**
   - Use strong passwords
   - Limit user privileges
   - Enable SSL connections
   - Regular security updates

2. **Backup:**
   ```bash
   # Create backup
   mysqldump -u civic_user -p civic_connect > backup.sql
   
   # Restore backup
   mysql -u civic_user -p civic_connect < backup.sql
   ```

3. **Monitoring:**
   - Enable slow query log
   - Monitor connection usage
   - Set up alerts for errors

## Next Steps:

Once MySQL is set up and the backend is running:

1. Start the frontend: `npm run dev` (in root directory)
2. Visit `http://localhost:5173`
3. Login with default credentials:
   - Admin: `admin@civic.gov` / `admin123`
   - Citizen: `citizen@example.com` / `citizen123`

## Support:

If you encounter issues:
1. Check MySQL error logs: `sudo tail -f /var/log/mysql/error.log`
2. Verify Prisma connection: `npx prisma db pull`
3. Check backend logs for detailed error messages
