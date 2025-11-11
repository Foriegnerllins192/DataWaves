# DataWay Admin Panel

This is the admin panel for the DataWay mobile data purchase application.

## Features
- Dashboard with statistics
- User management (view, add, delete users)
- Data plan management (view, add, delete plans)
- Transaction monitoring

## Access
The admin panel can be accessed at `http://localhost:3002/admin/dashboard.html` after logging in as an admin user.

## Technologies Used
- HTML/CSS/JavaScript
- Node.js/Express backend
- MySQL database

## Admin API Endpoints

### Dashboard
- `GET /api/admin/dashboard` - Get dashboard statistics

### Users
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Add a new user
- `PUT /api/admin/users/:id` - Update a user
- `DELETE /api/admin/users/:id` - Delete a user

### Data Plans
- `GET /api/admin/plans` - Get all data plans
- `POST /api/admin/plans` - Add a new data plan
- `PUT /api/admin/plans/:id` - Update a data plan
- `DELETE /api/admin/plans/:id` - Delete a data plan

### Transactions
- `GET /api/admin/transactions` - Get all transactions

## Authentication
All admin endpoints require authentication with an admin user account.

## Files
- `dashboard.html` - Admin dashboard
- `users.html` - User management
- `plans.html` - Data plan management
- `transactions.html` - Transaction monitoring
- `admin-styles.css` - Admin-specific styles