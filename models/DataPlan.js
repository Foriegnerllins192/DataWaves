const db = require('../config/db');
const pricingService = require('../services/pricingService');

class DataPlan {
  // Get all data plans
  static async getAll() {
    const query = 'SELECT * FROM data_plans ORDER BY provider, CAST(size AS INTEGER)';
    
    try {
      const result = await db.query(query);
      // Add customer price with markup
      return result.rows.map(plan => ({
        ...plan,
        customer_price: pricingService.calculateCustomerPrice(plan.price, plan.provider)
      }));
    } catch (error) {
      throw error;
      }
  }

  // Get data plans by provider
  static async getByProvider(provider) {
    const query = 'SELECT * FROM data_plans WHERE provider = $1 ORDER BY CAST(size AS INTEGER)';
    
    try {
      const result = await db.query(query, [provider]);
      // Add customer price with markup
      return result.rows.map(plan => ({
        ...plan,
        customer_price: pricingService.calculateCustomerPrice(plan.price, plan.provider)
      }));
    } catch (error) {
      throw error;
    }
  }

  // Get data plan by ID
  static async getById(id) {
    const query = 'SELECT * FROM data_plans WHERE id = $1';
    
    try {
      const result = await db.query(query, [id]);
      if (result.rows[0]) {
        // Add customer price with markup
        return {
          ...result.rows[0],
          customer_price: pricingService.calculateCustomerPrice(result.rows[0].price, result.rows[0].provider)
        };
      }
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DataPlan;