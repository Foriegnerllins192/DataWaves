# Admin Login Credentials

## Default Admin Account

**Email:** `admin@datawaves.com`  
**Password:** `DataWaves2026!`

## Admin Access URLs

- **Admin Dashboard:** http://localhost:3003/admin
- **Login Page:** http://localhost:3003/login.html

## Setup Instructions

### Option 1: Run Setup Script (Recommended)
```bash
npm run setup-admin
```

This will:
- Create or update the admin user in the database
- Use credentials from your `.env` file
- Display the login information

### Option 2: Manual Database Setup

If you need to manually create the admin user, run this SQL:

```sql
-- Create admin user (password: DataWaves2026!)
INSERT INTO users (full_name, email, password, phone, role) VALUES 
('DataWaves Admin', 'admin@datawaves.com', '$2b$10$rVHGOXHSA5lrvSy6TLWhbOxJqO0kO0oCdUWKDFyKKhjDQN8uEhihm', '+233208494123', 'admin')
ON CONFLICT (email) DO UPDATE SET 
  password = EXCLUDED.password,
  role = EXCLUDED.role;
```

### Option 3: Environment Variables

You can customize admin credentials in your `.env` file:

```env
# Admin User Credentials
ADMIN_EMAIL_LOGIN=admin@datawaves.com
ADMIN_PASSWORD=DataWaves2026!
```

## Admin Features

Once logged in as admin, you can access:

- **Dashboard:** Overview of system statistics
- **Users Management:** View and manage user accounts
- **Plans Management:** Create, edit, and delete data plans
- **Transactions:** Monitor all transactions and payments
- **System Settings:** Configure application settings

## Security Notes

⚠️ **Important Security Recommendations:**

1. **Change Default Password:** After first login, change the default password
2. **Use Strong Password:** Use a complex password with mixed characters
3. **Secure Environment:** Keep your `.env` file secure and never commit it to version control
4. **Regular Updates:** Regularly update admin credentials
5. **Monitor Access:** Keep track of admin login activities

## Troubleshooting

### Can't Login?
1. Verify the database is running and accessible
2. Check if the users table exists and has the admin user
3. Run the setup script: `npm run setup-admin`
4. Check server logs for authentication errors

### Forgot Password?
1. Run the setup script to reset: `npm run setup-admin`
2. Or manually update the password in the database
3. Use bcrypt to hash your new password

### Admin Panel Not Loading?
1. Ensure you're logged in as an admin user (role = 'admin')
2. Check the server is running on the correct port
3. Verify admin routes are properly configured

## Development vs Production

### Development
- Use the default credentials for local development
- Admin panel accessible at `http://localhost:3003/admin`

### Production
- **MUST** change default credentials before deployment
- Use environment variables for credentials
- Enable HTTPS for admin access
- Consider IP restrictions for admin panel
- Set up proper logging and monitoring

## Contact

If you need help with admin setup, contact the development team.