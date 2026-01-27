const db = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  // Create a new user
  static async create(userData) {
    const { full_name, email, password, phone, role = 'user' } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = 'INSERT INTO users (full_name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id';
    const values = [full_name, email, hashedPassword, phone, role];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0].id;
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    
    try {
      const result = await db.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT id, full_name, email, phone, role FROM users WHERE id = $1';
    
    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Get all users (for admin)
  static async getAll() {
    const query = 'SELECT id, full_name, email, phone, created_at FROM users ORDER BY created_at DESC';
    
    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;