# Neon PostgreSQL Setup Guide

This guide explains how to set up and configure Neon PostgreSQL for your DataWaves mobile data vending application.

## What is Neon?

Neon is a serverless PostgreSQL platform that provides:
- Automatic scaling
- Branching for database schemas
- Built-in connection pooling
- High availability
- Cost-effective pricing

## Step 1: Create a Neon Account

1. Visit [https://neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project
4. Choose a project name (e.g., "DataWaves")
5. Select your preferred region

## Step 2: Get Your Database Connection Details

After creating your project, Neon will provide you with connection details:

### Option A: Individual Connection Parameters
```
Host: your-project-name-123456.us-east-1.aws.neon.tech
Database: neondb
Username: your-username
Password: your-generated-password
Port: 5432
```

### Option B: Connection String (Recommended)
```
postgresql://username:password@hostname.neon.tech:5432/database?sslmode=require
```

## Step 3: Configure Your .env File

Choose one of the following configuration methods:

### Method 1: Using Individual Variables
```env
# Neon PostgreSQL Configuration
DB_HOST=your-project-name-123456.us-east-1.aws.neon.tech
DB_USER=your-username
DB_PASSWORD=your-generated-password
DB_NAME=neondb
DB_PORT=5432
DB_SSL=true
```

### Method 2: Using Connection String (Recommended)
```env
# Neon PostgreSQL Configuration using connection string
DATABASE_URL=postgresql://username:password@hostname.neon.tech:5432/database?sslmode=require

# Keep these for compatibility (can be empty when using DATABASE_URL)
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_PORT=5432
DB_SSL=true
```

## Step 4: Set Up Your Database Schema

1. **Connect to your Neon database** using the Neon Console SQL Editor or a PostgreSQL client
2. **Run the schema** from `mobile_data_app_postgresql.sql`:

```sql
-- Copy and paste the entire content of mobile_data_app_postgresql.sql
-- This will create all tables, indexes, and sample data
```

### Using Neon Console (Recommended)
1. Go to your Neon project dashboard
2. Click on "SQL Editor"
3. Copy the entire content from `mobile_data_app_postgresql.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute the schema

### Using psql Command Line
```bash
# If you have psql installed locally
psql "postgresql://username:password@hostname.neon.tech:5432/database?sslmode=require" -f mobile_data_app_postgresql.sql
```

## Step 5: Test Your Connection

Run your application to test the database connection:

```bash
npm start
```

You should see: `Connected to Neon PostgreSQL database successfully`

## Step 6: Verify Your Setup

1. **Check Tables**: Ensure all tables are created
   - users
   - data_plans  
   - transactions

2. **Check Sample Data**: Verify sample data is inserted
   - Admin user (admin@example.com)
   - Data plans for MTN, Telecel, AirtelTigo
   - Test user (john@example.com)

3. **Test Application**: Try registering a new user and making a test transaction

## Neon-Specific Features

### Database Branching
Neon allows you to create branches of your database for testing:
1. Go to your project dashboard
2. Click "Branches"
3. Create a new branch for development/testing
4. Use the branch connection string for testing

### Connection Pooling
Neon provides built-in connection pooling, but your application also uses pg Pool for additional connection management.

### Monitoring
Monitor your database usage in the Neon dashboard:
- Connection count
- Query performance
- Storage usage
- Compute usage

## Environment Variables Summary

For production deployment, ensure these environment variables are set:

```env
# Option 1: Connection String (Recommended)
DATABASE_URL=postgresql://username:password@hostname.neon.tech:5432/database?sslmode=require

# Option 2: Individual Variables
DB_HOST=your-neon-hostname.neon.tech
DB_USER=your-neon-username
DB_PASSWORD=your-neon-password
DB_NAME=your-neon-database-name
DB_PORT=5432
DB_SSL=true
```

## Troubleshooting

### Connection Issues
1. **SSL Required**: Neon requires SSL connections
   - Ensure `DB_SSL=true` or `sslmode=require` in connection string
2. **Timeout Issues**: Increase connection timeout in `config/db.js`
3. **Connection Limits**: Check your Neon plan's connection limits

### Common Errors
- `connection terminated unexpectedly`: Usually SSL configuration issue
- `password authentication failed`: Check username/password
- `database does not exist`: Verify database name in connection details

### Getting Help
- Neon Documentation: https://neon.tech/docs
- Neon Discord Community: https://discord.gg/92vNTzKDGp
- Neon Support: Available through dashboard

## Security Best Practices

1. **Environment Variables**: Never commit database credentials to version control
2. **Connection Limits**: Monitor and set appropriate connection limits
3. **SSL**: Always use SSL connections (enabled by default)
4. **Access Control**: Use Neon's IP allowlist if needed
5. **Backup**: Neon provides automatic backups, but consider additional backup strategies

## Cost Optimization

1. **Free Tier**: Neon offers a generous free tier
2. **Auto-scaling**: Database scales down when not in use
3. **Branching**: Use branches for development to avoid production costs
4. **Monitoring**: Monitor usage to optimize costs

Your DataWaves application is now configured to work with Neon PostgreSQL!