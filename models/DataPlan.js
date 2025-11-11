const db = require('../config/db');
const pricingService = require('../services/pricingService');

class DataPlan {
  // Get all data plans
  static async getAll() {
    const query = 'SELECT * FROM data_plans ORDER BY provider, CAST(size AS UNSIGNED)';
    
    try {
      const [rows] = await db.execute(query);
      // Add customer price with markup
      return rows.map(plan => ({
        ...plan,
        customer_price: pricingService.calculateCustomerPrice(plan.price, plan.provider)
      }));
    } catch (error) {
      throw error;
      }
  }

  // Get data plans by provider
  static async getByProvider(provider) {
    const query = 'SELECT * FROM data_plans WHERE provider = ? ORDER BY CAST(size AS UNSIGNED)';
    
    try {
      const [rows] = await db.execute(query, [provider]);
      // Add customer price with markup
      return rows.map(plan => ({
        ...plan,
        customer_price: pricingService.calculateCustomerPrice(plan.price, plan.provider)
      }));
    } catch (error) {
      throw error;
    }
  }

  // Get data plan by ID
  static async getById(id) {
    const query = 'SELECT * FROM data_plans WHERE id = ?';
    
    try {
      const [rows] = await db.execute(query, [id]);
      if (rows[0]) {
        // Add customer price with markup
        return {
          ...rows[0],
          customer_price: pricingService.calculateCustomerPrice(rows[0].price, rows[0].provider)
        };
      }
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DataPlan;