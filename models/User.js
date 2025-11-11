const db = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  // Create a new user
  static async create(userData) {
    const { full_name, email, password, phone } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = 'INSERT INTO users (full_name, email, password, phone) VALUES (?, ?, ?, ?)';
    const values = [full_name, email, hashedPassword, phone];
    
    try {
      const [result] = await db.execute(query, values);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    
    try {
      const [rows] = await db.execute(query, [email]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT id, full_name, email, phone, role FROM users WHERE id = ?';
    
    try {
      const [rows] = await db.execute(query, [id]);
      return rows[0];
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
      const [rows] = await db.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;