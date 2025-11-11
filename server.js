const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3003; // Changed from 3002 to 3003

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'dataway_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static files
app.use('/images', express.static(path.join(__dirname, 'images')));

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/login.html');
};

const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  // Redirect regular users trying to access admin pages
  if (req.session && req.session.user && req.session.user.role === 'user') {
    return res.redirect('/dashboard.html');
  }
  // Redirect unauthenticated users to login
  res.redirect('/login.html');
};

// API Routes
app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', require('./routes/payment'));

// Public routes (accessible to everyone)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// User dashboard - only accessible to authenticated users
app.get('/dashboard.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Account page - only accessible to authenticated users
app.get('/account.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'account.html'));
});

// Buy plan page - only accessible to authenticated users
app.get('/buy-plan.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'buy-plan.html'));
});

// Payment pages - only accessible to authenticated users
app.get('/payment.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'payment.html'));
});

app.get('/payment-success.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'payment-success.html'));
});

app.get('/payment-failed.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'payment-failed.html'));
});

app.get('/receipt.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'receipt.html'));
});

// Admin routes - only accessible to admin users
app.get('/admin', isAdmin, (req, res) => {
  res.redirect('/admin/dashboard.html');
});

app.get('/admin/dashboard.html', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'dashboard.html'));
});

app.get('/admin/users.html', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'users.html'));
});

app.get('/admin/plans.html', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'plans.html'));
});

app.get('/admin/transactions.html', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'transactions.html'));
});

// Network pages - accessible to everyone (but purchasing requires login)
app.get('/mtn.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mtn.html'));
});

app.get('/telecel.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'telecel.html'));
});

app.get('/at.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'at.html'));
});

// Authentication pages - accessible to everyone
app.get('/login.html', (req, res) => {
  // If already logged in, redirect to appropriate dashboard
  if (req.session && req.session.user) {
    if (req.session.user.role === 'admin') {
      return res.redirect('/admin/dashboard.html');
    } else {
      return res.redirect('/dashboard.html');
    }
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register.html', (req, res) => {
  // If already logged in, redirect to appropriate dashboard
  if (req.session && req.session.user) {
    if (req.session.user.role === 'admin') {
      return res.redirect('/admin/dashboard.html');
    } else {
      return res.redirect('/dashboard.html');
    }
  }
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Serve other HTML files with proper authentication
app.get('/:page', (req, res) => {
  const page = req.params.page;
  
  // List of pages that require authentication
  const authenticatedPages = [
    'dashboard', 'account', 'buy-plan', 
    'payment', 'payment-success', 'payment-failed', 'receipt'
  ];
  
  // List of pages that require admin access
  const adminPages = [
    'admin/dashboard', 'admin/users', 'admin/plans', 'admin/transactions'
  ];
  
  // List of public pages (accessible to everyone)
  const publicPages = [
    'index', 'mtn', 'telecel', 'at', 'login', 'register'
  ];
  
  // Handle admin pages specifically
  if (page.startsWith('admin/')) {
    // Check if user is admin
    if (req.session && req.session.user && req.session.user.role === 'admin') {
      const filePath = path.join(__dirname, 'public', `${page}.html`);
      res.sendFile(filePath, (err) => {
        if (err) {
          res.status(404).send('Page not found');
        }
      });
    } else {
      // Redirect based on user role
      if (req.session && req.session.user && req.session.user.role === 'user') {
        res.redirect('/dashboard.html');
      } else {
        res.redirect('/login.html');
      }
    }
    return;
  }
  
  if (authenticatedPages.includes(page)) {
    // Check if user is authenticated
    if (req.session && req.session.user) {
      res.sendFile(path.join(__dirname, 'public', `${page}.html`));
    } else {
      res.redirect('/login.html');
    }
  } else if (publicPages.includes(page)) {
    // Public pages
    res.sendFile(path.join(__dirname, 'public', `${page}.html`));
  } else {
    res.status(404).send('Page not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});