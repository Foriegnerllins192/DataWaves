const express = require('express');
const User = require('../models/User');
const DataPlan = require('../models/DataPlan');
const Transaction = require('../models/Transaction');
const validationService = require('../services/validationService');

const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;
    
    // Validate email
    const emailValidation = validationService.validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
    // Validate password
    const passwordValidation = validationService.validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        error: 'Password requirements not met', 
        details: passwordValidation.errors 
      });
    }
    
    // Validate phone number if provided
    if (phone) {
      const phoneValidation = validationService.validateGhanaPhoneNumber(phone);
      if (!phoneValidation.valid) {
        return res.status(400).json({ error: phoneValidation.error || 'Invalid phone number' });
      }
    }
    
    // Check if user already exists
    const existingUser = await User.findByEmail(emailValidation.email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Create new user
    const userId = await User.create({ 
      full_name, 
      email: emailValidation.email, 
      password, 
      phone: phone ? validationService.validateGhanaPhoneNumber(phone).formatted : null
    });
    
    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate email
    const emailValidation = validationService.validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Find user by email
    const user = await User.findByEmail(emailValidation.email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Store user in session (exclude password)
    const { password: _, ...userWithoutPassword } = user;
    req.session.user = userWithoutPassword;
    
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.clearCookie('connect.sid'); // Default session cookie name
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Get data plans
router.get('/plans', async (req, res) => {
  try {
    const { provider } = req.query;
    let plans;
    
    if (provider) {
      // Validate provider
      const validProviders = ['mtn', 'telecel', 'airteltigo'];
      if (!validProviders.includes(provider.toLowerCase())) {
        return res.status(400).json({ error: 'Invalid provider' });
      }
      
      plans = await DataPlan.getByProvider(provider);
    } else {
      plans = await DataPlan.getAll();
    }
    
    res.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transactions for logged in user
router.get('/transactions', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const transactions = await Transaction.getByUserId(req.session.user.id);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transaction by reference
router.get('/transaction/:reference', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { reference } = req.params;
    const transaction = await Transaction.getByReference(reference);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Check if user is authorized to view this transaction
    if (transaction.user_id !== req.session.user.id && req.session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user data
router.get('/user', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  res.json(req.session.user);
});

// Purchase data plan
router.post('/purchase', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { plan_id, phone_number } = req.body;
    
    // Validate phone number
    const phoneValidation = validationService.validateGhanaPhoneNumber(phone_number);
    if (!phoneValidation.valid) {
      return res.status(400).json({ error: phoneValidation.error || 'Invalid Ghana phone number' });
    }
    
    // Validate plan_id
    if (!plan_id || isNaN(parseInt(plan_id))) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }
    
    // Get plan details
    const plan = await DataPlan.getById(plan_id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    // Validate transaction data
    const transactionData = {
      user_id: req.session.user.id,
      plan_id,
      network: plan.provider,
      phone_number: phoneValidation.formatted,
      amount: plan.customer_price || plan.price
    };
    
    const transactionValidation = validationService.validateTransaction(transactionData);
    if (!transactionValidation.valid) {
      return res.status(400).json({ 
        error: 'Invalid transaction data', 
        details: transactionValidation.errors 
      });
    }
    
    // Create transaction
    const transactionId = await Transaction.create(transactionData);
    
    res.json({ 
      success: true, 
      message: 'Purchase successful',
      transactionId 
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;