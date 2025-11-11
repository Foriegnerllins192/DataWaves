const db = require('../config/db');

class Transaction {
  // Create a new transaction
  static async create(transactionData) {
    const { user_id, plan_id, network, phone_number, amount, status, payment_reference, confirmation_method, confirmation_contact, aggregator_response } = transactionData;
    
    const query = 'INSERT INTO transactions (user_id, plan_id, network, phone_number, amount, status, payment_reference, confirmation_method, confirmation_contact, aggregator_response) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [user_id, plan_id, network, phone_number, amount, status, payment_reference, confirmation_method, confirmation_contact, JSON.stringify(aggregator_response || {})];
    
    try {
      const [result] = await db.execute(query, values);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Get transactions by user ID
  static async getByUserId(userId) {
    const query = `
      SELECT t.*, dp.size, dp.price 
      FROM transactions t 
      JOIN data_plans dp ON t.plan_id = dp.id 
      WHERE t.user_id = ? 
      ORDER BY t.created_at DESC`;
    
    try {
      const [rows] = await db.execute(query, [userId]);
      // Parse JSON fields
      return rows.map(row => ({
        ...row,
        aggregator_response: row.aggregator_response ? JSON.parse(row.aggregator_response) : {}
      }));
    } catch (error) {
      throw error;
    }
  }

  // Get all transactions (for admin)
  static async getAll() {
    const query = `
      SELECT t.*, u.full_name, u.email, dp.size 
      FROM transactions t 
      JOIN users u ON t.user_id = u.id 
      JOIN data_plans dp ON t.plan_id = dp.id 
      ORDER BY t.created_at DESC`;
    
    try {
      const [rows] = await db.execute(query);
      // Parse JSON fields
      return rows.map(row => ({
        ...row,
        aggregator_response: row.aggregator_response ? JSON.parse(row.aggregator_response) : {}
      }));
    } catch (error) {
      throw error;
    }
  }

  // Get transaction by reference
  static async getByReference(reference) {
    const query = `
      SELECT t.*, dp.size, dp.price, dp.provider, u.full_name, u.email
      FROM transactions t
      JOIN data_plans dp ON t.plan_id = dp.id
      JOIN users u ON t.user_id = u.id
      WHERE t.payment_reference = ?`;
    
    try {
      const [rows] = await db.execute(query, [reference]);
      if (rows.length > 0) {
        const row = rows[0];
        return {
          ...row,
          aggregator_response: row.aggregator_response ? JSON.parse(row.aggregator_response) : {}
        };
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Update transaction status
  static async updateStatus(reference, status) {
    const query = 'UPDATE transactions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE payment_reference = ?';
    
    try {
      await db.execute(query, [status, reference]);
    } catch (error) {
      throw error;
    }
  }

  // Update aggregator response
  static async updateAggregatorResponse(reference, response) {
    const query = 'UPDATE transactions SET aggregator_response = ?, updated_at = CURRENT_TIMESTAMP WHERE payment_reference = ?';
    
    try {
      await db.execute(query, [JSON.stringify(response), reference]);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Transaction;