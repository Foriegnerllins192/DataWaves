# DataWaves Project Setup Guide

This guide will help you set up the DataWaves mobile data selling website with PostgreSQL database using Supabase.

## Prerequisites

1. Node.js (version 14 or higher)
2. Supabase account (free tier available at supabase.com)
3. PostgreSQL client (optional, for advanced database management)

## Quick Start

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

## Database Setup with Supabase

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up or log in
2. Click "New Project"
3. Enter your project details:
   - Name: `datawaves-mobile-data`
   - Database Password: Choose a strong password
   - Region: Select the region closest to your users
4. Click "Create New Project" and wait for provisioning (usually takes 1-2 minutes)

### 2. Get Connection Details

1. Once your project is ready, go to the "Settings" → "Database" section
2. Note down the following connection details:
   - Host (e.g., `db.xxxxxxxxxxxxxx.supabase.co`)
   - Port: `5432` (default)
   - Database Name: `postgres` (default)
   - User: `postgres` (default)
   - Password: The password you set during project creation

### 3. Update Environment Variables

Open the `.env` file in the project root and update the database configuration section:

```env
# Database Configuration
DB_HOST=your-supabase-host.supabase.co
DB_USER=postgres
DB_PASSWORD=your-database-password
DB_NAME=postgres
DB_PORT=5432
DB_SSL=true
```

Replace the placeholder values with your actual Supabase credentials.

### 4. Create the Database Schema

1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor" in the left sidebar
3. Copy the contents of `mobile_data_app_postgresql.sql` from this project
4. Paste it into your Supabase SQL Editor
5. Click "Run" to execute the SQL script

This will create all necessary tables, indexes, and sample data.

## Configure Other Services

### Payment Processing (Paystack)

Update the Paystack configuration in `.env` with your actual API keys:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_actual_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_actual_public_key_here
```

### SMS Service (SMS Phone API)

Update the SMS Phone API configuration in `.env` with your actual API key:

```env
# SMS Phone API Configuration
SMS_PHONE_API_KEY=your_actual_sms_phone_api_key
```

**To get your SMS Phone API key:**
1. Visit https://smsphoneapi.com
2. Create an account or log in
3. Navigate to your dashboard
4. Copy your API key
5. Replace `your_actual_sms_phone_api_key` in the `.env` file

### Email Service

Update the email configuration in `.env` with your actual SMTP settings:

```env
# Email Configuration
SMTP_HOST=your-smtp-host.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
SMTP_FROM=no-reply@datawaves.com
```

## Start the Application

1. Start the development server:
   ```bash
   npm run dev
   ```
   
   Or for production:
   ```bash
   npm start
   ```

2. Access the application at `http://localhost:3003`

## Default Accounts

The database includes default accounts for testing:

- Admin account:
  - Email: `admin@example.com`
  - Password: `password123`

- Test user account:
  - Email: `john@example.com`
  - Password: `password123`

## Troubleshooting

### Database Connection Issues

1. Verify your Supabase credentials are correct
2. Ensure your Supabase project is fully provisioned
3. Check that `DB_SSL=true` is set in your `.env` file
4. Make sure your firewall allows connections on port 5432

### Login Problems

1. Verify the database was imported correctly
2. Check that you're using the correct email and password
3. The default passwords are hashed - use the provided credentials

### Other Issues

1. Check the console logs for error messages
2. Ensure all environment variables are properly set
3. Verify all required dependencies are installed

## Next Steps

1. Customize the data plans in the admin panel
2. Set up your Paystack account for live payments
3. Configure your SMS Phone API account for SMS notifications
4. Customize the branding and styling to match your business