# DataWay - Mobile Data Purchase Application (Complete Implementation)

This is a complete Node.js/Express implementation of a mobile data purchase application for Ghana, with full payment processing, aggregator integration, and admin features.

## Features Implemented

### 1. User Management
- User registration and authentication
- Session-based login system
- Password hashing with bcrypt
- User profile management

### 2. Data Plans
- Browse data plans for multiple networks (MTN, Telecel, AirtelTigo)
- Dynamic pricing with markup system
- Plan management in admin panel

### 3. Payment Processing
- Paystack integration for secure payments
- Mobile money payment option (placeholder)
- Payment webhook verification
- Transaction logging

### 4. Aggregator Integration
- Reloadly API integration (easily swappable for Africa's Talking or Korba)
- Automatic data topup after successful payment
- Account balance checking
- Operator ID mapping

### 5. Admin Dashboard
- User management
- Data plan management
- Transaction monitoring
- Sales analytics
- Markup configuration
- Aggregator balance monitoring

### 6. Security Features
- Ghana phone number validation
- Email validation
- Webhook signature verification
- Environment variable configuration
- Input sanitization

### 7. Additional Features
- Responsive design
- Transaction history for users
- Logging system for debugging and monitoring
- Error handling and user feedback

## Technologies Used
- Node.js
- Express.js
- MySQL (with mysql2 package)
- Paystack API for payments
- Reloadly API for data topups
- bcrypt for password hashing
- express-session for session management
- HTML/CSS/JavaScript for frontend
- dotenv for environment management

## Project Structure
```
DATAWAY/
├── config/
│   └── db.js              # Database configuration
├── logs/                  # Application logs
├── models/
│   ├── User.js            # User model
│   ├── DataPlan.js        # Data plan model
│   └── Transaction.js     # Transaction model
├── public/
│   ├── admin/             # Admin panel files
│   ├── images/            # Network logos and other images
│   ├── *.html             # All HTML files
│   ├── style.css          # Stylesheet
│   └── script.js          # Client-side JavaScript
├── routes/
│   ├── api.js             # User API routes
│   ├── admin.js           # Admin API routes
│   └── payment.js         # Payment processing routes
├── services/
│   ├── paymentService.js  # Paystack integration
│   ├── aggregatorService.js# Reloadly integration
│   ├── pricingService.js  # Markup calculations
│   └── validationService.js# Input validation
├── utils/
│   └── logger.js          # Application logging
├── server.js              # Main server file
├── package.json           # Project dependencies
├── .env                   # Environment variables
└── README.md              # This file
```

## Setup Instructions

1. **Database Setup**:
   - Create a MySQL database named `mobile_data_app`
   - Import the database schema from `mobile_data_app.sql` (with validity periods) or `mobile_data_app_no_validity.sql` (without validity periods)
   - Update the database credentials in `.env` if needed
   - See `DATABASE_SETUP.md` or `DATABASE_SETUP_NO_VALIDITY.md` for detailed instructions

2. **Environment Configuration**:
   - Update `.env` with your:
     - Paystack API keys
     - Reloadly API credentials
     - Database configuration
     - Session secret

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Start the Server**:
   ```bash
   npm start
   ```
   or for development with auto-restart:
   ```bash
   npm run dev
   ```

5. **Access the Application**:
   Open your browser and navigate to `http://localhost:3002`

## API Endpoints

### User API
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/plans` - Get all data plans
- `GET /api/plans?provider=network` - Get plans for specific network
- `GET /api/transactions` - Get user transactions
- `GET /api/user` - Get current user data
- `POST /api/purchase` - Purchase a data plan

### Payment API
- `POST /api/payment/initialize` - Initialize Paystack payment
- `GET /api/payment/callback` - Payment callback endpoint
- `POST /api/payment/webhook` - Payment webhook endpoint

### Admin API
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Add a new user
- `PUT /api/admin/users/:id` - Update a user
- `DELETE /api/admin/users/:id` - Delete a user
- `GET /api/admin/plans` - Get all data plans
- `POST /api/admin/plans` - Add a new data plan
- `PUT /api/admin/plans/:id` - Update a data plan
- `DELETE /api/admin/plans/:id` - Delete a data plan
- `GET /api/admin/transactions` - Get all transactions
- `GET /api/admin/markups` - Get all markups
- `POST /api/admin/markups` - Update markup for a network

## Payment Flow

1. User selects a data plan
2. User enters phone number and selects payment method
3. System initializes payment with Paystack
4. User completes payment on Paystack page
5. Paystack sends webhook notification
6. System verifies payment and delivers data bundle via aggregator
7. Transaction is logged and user receives confirmation

## Security Measures

- All API keys stored in environment variables
- Passwords hashed with bcrypt
- Webhook signatures verified
- Phone number validation for Ghana format
- Email validation
- Session-based authentication
- Input sanitization and validation

## Logging

All important events are logged to daily files in the `logs/` directory:
- Payment initializations
- Payment verifications
- Aggregator API calls
- Errors and exceptions

## Author
DataWay Team

## License
MIT