# DataWay - Mobile Data Purchase Application

**IMPORTANT: Please see [COMPREHENSIVE_README.md](COMPREHENSIVE_README.md) for the complete documentation of the fully implemented system.**

This is a converted Node.js/Express version of the original PHP application for purchasing mobile data plans.

## Features
- User registration and authentication
- Browse data plans for multiple networks (MTN, Telecel, AirtelTigo)
- Purchase data plans
- View transaction history
- Responsive design

## Technologies Used
- Node.js
- Express.js
- MySQL (with mysql2 package)
- bcrypt for password hashing
- express-session for session management
- HTML/CSS/JavaScript for frontend

## Project Structure
```
DATAWAY/
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
   - Create a MySQL database named `mobile_data_app`
   - Import the database schema from `mobile_data_app.sql` (with validity periods) or `mobile_data_app_no_validity.sql` (without validity periods)
   - Update the database credentials in `config/db.js` if needed
   - See `DATABASE_SETUP.md` or `DATABASE_SETUP_NO_VALIDITY.md` for detailed instructions

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
   Open your browser and navigate to `http://localhost:3002`

## API Endpoints

- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/plans` - Get all data plans
- `GET /api/transactions` - Get user transactions
- `POST /api/purchase` - Purchase a data plan
- `GET /api/user` - Get current user data

## Changes from PHP Version

1. **Backend**: 
   - Converted from PHP to Node.js/Express
   - Uses MySQL2 instead of PDO
   - Implements proper session management with express-session
   - Password hashing with bcrypt

2. **Frontend**:
   - All PHP files converted to static HTML
   - JavaScript updated to work with new API endpoints
   - CSS remains unchanged

3. **Security**:
   - Improved password handling with bcrypt
   - Proper session management
   - Input validation

## Notes

- The CSS file (`style.css`) remains unchanged from the PHP version
- All HTML files are now static and served directly by Express
- JavaScript has been updated to work with the new Node.js API endpoints
- Database schema should match the original PHP application

## Author
DataWay Team

## License
MIT