const express = require('express');
const db = require('../config/db');
const User = require('../models/User');
const DataPlan = require('../models/DataPlan');
const Transaction = require('../models/Transaction');
const pricingService = require('../services/pricingService');
const validationService = require('../services/validationService');

const router = express.Router();

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: 'Admin access required' });
};

// Get admin dashboard data
router.get('/dashboard', isAdmin, async (req, res) => {
  try {
    // Get counts
    const [userCountResult, planCountResult, salesResult] = await Promise.all([
      // User count
      db.query('SELECT COUNT(*) as count FROM users'),
      // Plan count
      db.query('SELECT COUNT(*) as count FROM data_plans'),
      // Today's sales
      db.query(`
        SELECT SUM(amount) as total 
        FROM transactions 
        WHERE DATE(created_at) = CURRENT_DATE AND status = 'success'
      `)
    ]);
    
    const userCount = userCountResult.rows[0].count;
    const planCount = planCountResult.rows[0].count;
    const salesToday = salesResult.rows[0].total || 0;
    
    // Get recent transactions
    const transactionsResult = await db.query(`
      SELECT t.*, u.full_name as user, dp.size as plan, dp.provider as network
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      JOIN data_plans dp ON t.plan_id = dp.id
      ORDER BY t.created_at DESC
      LIMIT 10
    `);
    
    const recentTransactions = transactionsResult.rows.map(tx => ({
      user: tx.user,
      plan: tx.plan,
      network: tx.network,
      amount: tx.amount,
      date: tx.created_at.toISOString().split('T')[0],
      status: tx.status
    }));
    
    res.json({
      userCount,
      planCount,
      salesToday: `GHC ${parseFloat(salesToday).toFixed(2)}`,
      recentTransactions
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users (for admin)
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new user (for admin)
router.post('/users', isAdmin, async (req, res) => {
  try {
    const { full_name, email, phone, password, role } = req.body;
    
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
    let formattedPhone = null;
    if (phone) {
      const phoneValidation = validationService.validateGhanaPhoneNumber(phone);
      if (!phoneValidation.valid) {
        return res.status(400).json({ error: phoneValidation.error || 'Invalid phone number' });
      }
      formattedPhone = phoneValidation.formatted;
    }
    
    // Validate role
    const validRoles = ['user', 'admin'];
    const userRole = role && validRoles.includes(role) ? role : 'user';
    
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
      phone: formattedPhone,
      role: userRole
    });
    
    res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (error) {
    console.error('Add user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user (for admin)
router.put('/users/:id', isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { full_name, email, phone, role } = req.body;
    
    // Validate user ID
    if (isNaN(parseInt(userId))) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    // Validate email if provided
    let validatedEmail = email;
    if (email) {
      const emailValidation = validationService.validateEmail(email);
      if (!emailValidation.valid) {
        return res.status(400).json({ error: 'Invalid email address' });
      }
      validatedEmail = emailValidation.email;
    }
    
    // Validate phone number if provided
    let formattedPhone = phone;
    if (phone) {
      const phoneValidation = validationService.validateGhanaPhoneNumber(phone);
      if (!phoneValidation.valid) {
        return res.status(400).json({ error: phoneValidation.error || 'Invalid phone number' });
      }
      formattedPhone = phoneValidation.formatted;
    }
    
    // Validate role if provided
    let validatedRole = role;
    if (role) {
      const validRoles = ['user', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      validatedRole = role;
    }
    
    const query = 'UPDATE users SET full_name = $1, email = $2, phone = $3, role = $4 WHERE id = $5';
    await db.query(query, [full_name, validatedEmail, formattedPhone, validatedRole, userId]);
    
    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (for admin)
router.delete('/users/:id', isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Validate user ID
    if (isNaN(parseInt(userId))) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    // Don't allow deleting admin users
    const userResult = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userResult.rows[0] && userResult.rows[0].role === 'admin') {
      return res.status(400).json({ error: 'Cannot delete admin users' });
    }
    
    const query = 'DELETE FROM users WHERE id = $1';
    await db.query(query, [userId]);
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all data plans (for admin)
router.get('/plans', isAdmin, async (req, res) => {
  try {
    const plans = await DataPlan.getAll();
    res.json(plans);
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new data plan (for admin)
router.post('/plans', isAdmin, async (req, res) => {
  try {
    const { provider, size, price } = req.body;
    
    // Validate data plan
    const planData = { provider, size, price };
    const planValidation = validationService.validateDataPlan(planData);
    if (!planValidation.valid) {
      return res.status(400).json({ 
        error: 'Invalid data plan', 
        details: planValidation.errors 
      });
    }
    
    const query = 'INSERT INTO data_plans (provider, size, price, custom) VALUES ($1, $2, $3, 1) RETURNING id';
    const result = await db.query(query, [provider, size, price]);
    
    res.status(201).json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error('Add plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update data plan (for admin)
router.put('/plans/:id', isAdmin, async (req, res) => {
  try {
    const planId = req.params.id;
    const { provider, size, price } = req.body;
    
    // Validate plan ID
    if (isNaN(parseInt(planId))) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }
    
    // Validate data plan
    const planData = { provider, size, price };
    const planValidation = validationService.validateDataPlan(planData);
    if (!planValidation.valid) {
      return res.status(400).json({ 
        error: 'Invalid data plan', 
        details: planValidation.errors 
      });
    }
    
    const query = 'UPDATE data_plans SET provider = $1, size = $2, price = $3 WHERE id = $4';
    await db.query(query, [provider, size, price, planId]);
    
    res.json({ success: true, message: 'Plan updated successfully' });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete data plan (for admin)
router.delete('/plans/:id', isAdmin, async (req, res) => {
  try {
    const planId = req.params.id;
    
    // Validate plan ID
    if (isNaN(parseInt(planId))) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }
    
    const query = 'DELETE FROM data_plans WHERE id = $1';
    await db.query(query, [planId]);
    
    res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all transactions (for admin)
router.get('/transactions', isAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.getAll();
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all markups
router.get('/markups', isAdmin, (req, res) => {
  try {
    const markups = pricingService.getAllMarkups();
    res.json(markups);
  } catch (error) {
    console.error('Get markups error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update markup for a network
router.post('/markups', isAdmin, (req, res) => {
  try {
    const { network, markup } = req.body;
    
    // Validate input
    if (!network || markup === undefined) {
      return res.status(400).json({ error: 'Network and markup are required' });
    }
    
    // Validate network
    const validNetworks = ['mtn', 'telecel', 'airteltigo'];
    if (!validNetworks.includes(network.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid network' });
    }
    
    // Validate markup
    const markupValue = parseFloat(markup);
    if (isNaN(markupValue) || markupValue < 0) {
      return res.status(400).json({ error: 'Invalid markup value' });
    }
    
    pricingService.setMarkup(network, markupValue);
    res.json({ success: true, message: 'Markup updated successfully' });
  } catch (error) {
    console.error('Update markup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;