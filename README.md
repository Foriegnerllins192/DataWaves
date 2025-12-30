# DataWaves - Mobile Data Purchase Application

**IMPORTANT: Please see [COMPREHENSIVE_README.md](COMPREHENSIVE_README.md) for the complete documentation of the fully implemented system.**

This is a Node.js/Express application for purchasing mobile data plans.

## Features
- User registration and authentication
- Browse data plans for multiple networks (MTN, Telecel, AirtelTigo)
- Purchase data plans
- View transaction history
- Responsive design

## Technologies Used
- Node.js
- Express.js
- PostgreSQL (with pg package)
- bcrypt for password hashing
- express-session for session management
- HTML/CSS/JavaScript for frontend

## Project Structure
```
DATAWAVES/
├── config/
│   └── db.js              # Database configuration
├── models/
│   ├── User.js            # User model
│   ├── DataPlan.js        # Data plan model
│   └── Transaction.js     # Transaction model
├── public/
│   ├── images/            # Network logos and other images
│   ├── *.html             # All HTML files
│   ├── style.css          # Stylesheet (unchanged from PHP version)
│   └── script.js          # Client-side JavaScript
├── routes/
│   └── api.js             # API routes
├── server.js              # Main server file
├── package.json           # Project dependencies
└── README.md              # This file
```

## Setup Instructions

1. **Database Setup**:
   - Set up a PostgreSQL database using Supabase (see [PROJECT_SETUP_GUIDE.md](PROJECT_SETUP_GUIDE.md) for detailed instructions)
   - Import the database schema from `mobile_data_app_postgresql.sql`
   - Update the database credentials in `.env` file
   - See [POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md) for detailed PostgreSQL setup instructions

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Server**:
   ```bash
   npm start
   ```
   or for development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Access the Application**:
   Open your browser and navigate to `http://localhost:3003`

## API Endpoints

- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/plans` - Get all data plans
- `GET /api/transactions` - Get user transactions
- `POST /api/purchase` - Purchase a data plan
- `GET /api/user` - Get current user data

## Backend Implementation

1. **Technology Stack**: 
   - Built with Node.js/Express instead of PHP
   - Uses PostgreSQL with pg package instead of MySQL
   - Implements proper session management with express-session
   - Password hashing with bcrypt

2. **Frontend**:
   - All pages converted to static HTML
   - JavaScript updated to work with new API endpoints
   - CSS remains unchanged

3. **Security**:
   - Improved password handling with bcrypt
   - Proper session management
   - Input validation

## Notes

- The CSS file (`style.css`) remains unchanged from the original version
- All HTML files are now static and served directly by Express
- JavaScript has been updated to work with the new Node.js API endpoints
- Database schema has been adapted for PostgreSQL

## Author
DataWaves Team

## License
MIT