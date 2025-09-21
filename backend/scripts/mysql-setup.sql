-- MySQL Database Setup for Civic Connect
-- Run this script to create the database and user

-- Create database
CREATE DATABASE IF NOT EXISTS civic_connect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (replace 'civic_user' and 'your_password' with your preferred credentials)
CREATE USER IF NOT EXISTS 'civic_user'@'localhost' IDENTIFIED BY 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON civic_connect.* TO 'civic_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Use the database
USE civic_connect;

-- Show confirmation
SELECT 'Civic Connect database setup completed successfully!' as message;
