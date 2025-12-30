# PostgreSQL Database Setup for DataWaves

This guide will help you set up the PostgreSQL database for the DataWaves mobile data selling website using Supabase.

## Prerequisites

1. Supabase account (free tier available at supabase.com)
2. PostgreSQL client (psql, pgAdmin, or any PostgreSQL client)

## Database Setup Steps

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

### 3. Connect to Your Supabase Database

You can connect using various methods:

#### Option 1: Using psql command line
```bash
psql postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres
```

#### Option 2: Using Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor" in the left sidebar
3. You can run SQL queries directly in the editor

### 4. Create the Database Schema

1. Copy the contents of `mobile_data_app_postgresql.sql` from this project
2. Paste it into your Supabase SQL Editor or run it through your PostgreSQL client
3. Execute the SQL script to create all tables, indexes, and sample data

### 5. Update Environment Variables

Update your `.env` file with your Supabase connection details:

```env
# Database Configuration
DB_HOST=[YOUR-SUPABASE-HOST]
DB_USER=postgres
DB_PASSWORD=[YOUR-DATABASE-PASSWORD]
DB_NAME=postgres
DB_PORT=5432
DB_SSL=true
```

### 6. Test the Connection

1. Start your Node.js server:
   ```bash
   npm start
   ```
   or for development:
   ```bash
   npm run dev
   ```

2. Access the application at `http://localhost:3003`

### 7. Test Admin Login

The database includes default accounts:

- Admin account:
  - Email: `admin@example.com`
  - Password: `password123`

- Test user account:
  - Email: `john@example.com`
  - Password: `password123`

## Database Structure Details

### Users Table
- `id`: Primary key
- `full_name`: User's full name
- `email`: User's email (unique)
- `password`: Hashed password
- `phone`: User's phone number
- `role`: User role ('user' or 'admin')
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### Data Plans Table
- `id`: Primary key
- `provider`: Network provider (mtn, telecel, airteltigo)
- `size`: Data bundle size in GB
- `price`: Base price in GHC
- `validity_days`: Number of days the bundle is valid
- `custom`: Flag for custom plans
- `created_at`: Plan creation timestamp
- `updated_at`: Last update timestamp

### Transactions Table
- `id`: Primary key
- `user_id`: Foreign key to users table
- `plan_id`: Foreign key to data_plans table
- `network`: Network provider
- `phone_number`: Recipient phone number
- `amount`: Transaction amount in GHC
- `status`: Transaction status (pending, paid, success, failed, refunded)
- `payment_reference`: Payment reference from Paystack
- `confirmation_method`: How to send confirmation (sms or email)
- `confirmation_contact`: Contact info for confirmation
- `aggregator_response`: JSON response from aggregator API
- `created_at`: Transaction creation timestamp
- `updated_at`: Last update timestamp

## Troubleshooting

### If you get a connection error:
1. Verify your connection details are correct
2. Ensure your Supabase project is fully provisioned
3. Check that your firewall allows connections on port 5432
4. Make sure `DB_SSL=true` is set in your .env file

### If you can't log in:
1. Verify the database was imported correctly
2. Check that you're using the correct email and password
3. Make sure the bcrypt hashed passwords are properly stored

### If you need to reset the database:
1. Drop the existing tables:
   ```sql
   DROP TABLE IF EXISTS transactions, data_plans, users CASCADE;
   ```
2. Recreate the schema by running the SQL script again

## Next Steps

After setting up the database:
1. Update the database credentials in your `.env` file
2. Start your Node.js server
3. Access the application at `http://localhost:3003`
4. Log in with the admin credentials to manage data plans and view transactions