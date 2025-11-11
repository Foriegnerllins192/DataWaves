# Database Setup Instructions for XAMPP

This guide will help you set up the MySQL database for the DataWay mobile data selling website using XAMPP.

**Note:** If you want data bundles without validity periods (so they don't expire), please use `DATABASE_SETUP_NO_VALIDITY.md` instead and import `mobile_data_app_no_validity.sql`.

## Prerequisites

1. XAMPP installed on your system
2. Apache and MySQL services running in XAMPP Control Panel

## Database Setup Steps

### 1. Start XAMPP Services
1. Open XAMPP Control Panel
2. Start the Apache and MySQL services by clicking their respective "Start" buttons
3. Make sure both services show a green "Running" status

### 2. Access phpMyAdmin
1. Open your web browser
2. Navigate to `http://localhost/phpmyadmin`

### 3. Create the Database
1. In phpMyAdmin, click on the "Databases" tab
2. In the "Create database" field, enter: `mobile_data_app`
3. Select "utf8mb4_general_ci" as the collation
4. Click the "Create" button

### 4. Import the Database Schema
1. Click on the `mobile_data_app` database in the left sidebar
2. Click on the "Import" tab at the top
3. Click the "Choose File" button
4. Navigate to your project folder: `c:\xampp\htdocs\DATAWAY\`
5. Select the `mobile_data_app.sql` file
6. Make sure "Format" is set to "SQL"
7. Click the "Go" button at the bottom

### 5. Verify the Database Setup
After importing, you should see three tables in the `mobile_data_app` database:
- `users` - Contains user accounts (including admin)
- `data_plans` - Contains mobile data plans for different providers
- `transactions` - Contains transaction records

### 6. Test Admin Login
The database includes a default admin account:
- Email: `admin@example.com`
- Password: `password123`

And a test user account:
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
- `aggregator_response`: JSON response from aggregator API
- `created_at`: Transaction creation timestamp
- `updated_at`: Last update timestamp

## Troubleshooting

### If you get an error during import:
1. Make sure the database name matches exactly (`mobile_data_app`)
2. Check that MySQL service is running
3. Try clearing any existing tables and re-importing

### If you can't log in:
1. Verify the database was imported correctly
2. Check that the Apache and MySQL services are running
3. Make sure you're using the correct email and password

### If you need to reset the database:
1. Drop the `mobile_data_app` database
2. Recreate it following the steps above
3. Re-import the SQL file

## Next Steps

After setting up the database:
1. Update the database credentials in your `.env` file if needed
2. Start your Node.js server
3. Access the application at `http://localhost:3002`
4. Log in with the admin credentials to manage data plans and view transactions