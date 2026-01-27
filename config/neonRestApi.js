const axios = require('axios');

/**
 * Neon REST API Database Service
 * This service provides database operations using Neon's REST API
 * instead of traditional PostgreSQL connections
 */
class NeonRestAPI {
  constructor() {
    this.baseURL = process.env.NEON_DATA_API_URL;
    this.apiKey = process.env.NEON_API_KEY;
    
    if (!this.baseURL) {
      throw new Error('NEON_DATA_API_URL environment variable is required');
    }
    
    if (!this.apiKey) {
      console.warn('NEON_API_KEY not configured - some operations may fail');
    }
    
    // Configure axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : undefined
      },
      timeout: 10000
    });
  }

  /**
   * Execute a SELECT query
   * @param {string} table - Table name
   * @param {object} options - Query options (select, where, order, limit)
   * @returns {Promise<Array>} Query results
   */
  async select(table, options = {}) {
    try {
      const { select = '*', where = {}, order, limit } = options;
      
      let url = `/${table}`;
      const params = new URLSearchParams();
      
      // Add select fields
      if (select !== '*') {
        params.append('select', select);
      }
      
      // Add where conditions
      Object.entries(where).forEach(([key, value]) => {
        if (typeof value === 'object' && value.operator) {
          params.append(key, `${value.operator}.${value.value}`);
        } else {
          params.append(key, `eq.${value}`);
        }
      });
      
      // Add ordering
      if (order) {
        params.append('order', order);
      }
      
      // Add limit
      if (limit) {
        params.append('limit', limit);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await this.client.get(url);
      return response.data;
    } catch (error) {
      console.error('Neon REST API SELECT error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Execute an INSERT query
   * @param {string} table - Table name
   * @param {object|array} data - Data to insert
   * @returns {Promise<Array>} Inserted records
   */
  async insert(table, data) {
    try {
      const response = await this.client.post(`/${table}`, data, {
        headers: {
          'Prefer': 'return=representation'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Neon REST API INSERT error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Execute an UPDATE query
   * @param {string} table - Table name
   * @param {object} data - Data to update
   * @param {object} where - Where conditions
   * @returns {Promise<Array>} Updated records
   */
  async update(table, data, where) {
    try {
      let url = `/${table}`;
      const params = new URLSearchParams();
      
      // Add where conditions
      Object.entries(where).forEach(([key, value]) => {
        if (typeof value === 'object' && value.operator) {
          params.append(key, `${value.operator}.${value.value}`);
        } else {
          params.append(key, `eq.${value}`);
        }
      });
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await this.client.patch(url, data, {
        headers: {
          'Prefer': 'return=representation'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Neon REST API UPDATE error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Execute a DELETE query
   * @param {string} table - Table name
   * @param {object} where - Where conditions
   * @returns {Promise<Array>} Deleted records
   */
  async delete(table, where) {
    try {
      let url = `/${table}`;
      const params = new URLSearchParams();
      
      // Add where conditions
      Object.entries(where).forEach(([key, value]) => {
        if (typeof value === 'object' && value.operator) {
          params.append(key, `${value.operator}.${value.value}`);
        } else {
          params.append(key, `eq.${value}`);
        }
      });
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await this.client.delete(url, {
        headers: {
          'Prefer': 'return=representation'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Neon REST API DELETE error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Execute a raw SQL query (if supported by your Neon setup)
   * @param {string} query - SQL query
   * @param {array} params - Query parameters
   * @returns {Promise<Array>} Query results
   */
  async query(query, params = []) {
    try {
      // This would require RPC function setup in your database
      const response = await this.client.post('/rpc/execute_sql', {
        query: query,
        params: params
      });
      return response.data;
    } catch (error) {
      console.error('Neon REST API QUERY error:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new NeonRestAPI();