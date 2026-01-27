const axios = require('axios');
const logger = require('../utils/logger');
const emailService = require('./emailService');

class AggregatorService {
  constructor() {
    this.clientId = process.env.RELOADLY_CLIENT_ID;
    this.clientSecret = process.env.RELOADLY_CLIENT_SECRET;
    this.baseUrl = process.env.RELOADLY_BASE_URL;
    this.accessToken = null;
    this.tokenExpiry = null;
    this.operatorCache = {};
    this.lowBalanceThreshold = process.env.LOW_BALANCE_THRESHOLD || 100; // GHC
  }

  // Get access token for Reloadly API
  async getAccessToken() {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        'https://auth.reloadly.com/oauth/token',
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials',
          audience: this.baseUrl
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry to 55 minutes from now (tokens expire in 1 hour)
      this.tokenExpiry = Date.now() + (55 * 60 * 1000);

      return this.accessToken;
    } catch (error) {
      logger.error('Failed to get access token', { error: error.message });
      throw new Error(`Failed to get access token: ${error.response?.data?.message || error.message}`);
    }
  }

  // Top up data for a phone number (data bundles don't expire)
  async topup(phoneNumber, operatorId, amount) {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.post(
        `${this.baseUrl}/topups`,
        {
          recipientPhone: {
            countryCode: 'GH',
            number: phoneNumber
          },
          operatorId: operatorId,
          amount: amount,
          useLocalAmount: false
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/com.reloadly.topups-v1+json'
          }
        }
      );

      logger.info('Topup successful', { 
        transactionId: response.data.transactionId, 
        phoneNumber, 
        operatorId, 
        amount 
      });

      return response.data;
    } catch (error) {
      logger.error('Topup failed', { 
        error: error.message, 
        phoneNumber, 
        operatorId, 
        amount 
      });
      throw new Error(`Topup failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get available data bundles for an operator
  async getBundles(operatorId) {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(
        `${this.baseUrl}/operators/${operatorId}/data`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/com.reloadly.topups-v1+json'
          }
        }
      );

      // Return bundles as-is from the API
      const bundles = response.data;
      if (bundles && Array.isArray(bundles)) {
        return bundles;
      }

      return bundles;
    } catch (error) {
      logger.error('Failed to get bundles', { error: error.message, operatorId });
      throw new Error(`Failed to get bundles: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get all operators for Ghana
  async getGhanaOperators() {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(
        `${this.baseUrl}/operators/countries/GH`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/com.reloadly.topups-v1+json'
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to get Ghana operators', { error: error.message });
      throw new Error(`Failed to get Ghana operators: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get operator ID by name (for Ghana networks)
  getOperatorId(network) {
    // These are example IDs - in a real implementation, you would get these from the API
    const operatorIds = {
      'mtn': 1,      // Example MTN Ghana operator ID
      'telecel': 2,  // Example Telecel Ghana operator ID
      'airteltigo': 3, // Example AirtelTigo Ghana operator ID
      'airtel': 3,   // AirtelTigo is Airtel in Ghana
      'tigo': 3      // AirtelTigo is Tigo in Ghana
    };

    return operatorIds[network.toLowerCase()];
  }

  // Check account balance
  async checkBalance() {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(
        `${this.baseUrl}/accounts/balance`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/com.reloadly.topups-v1+json'
          }
        }
      );

      const balance = response.data;
      
      // Check if balance is low
      if (balance.balance < this.lowBalanceThreshold) {
        logger.warn('Low aggregator balance detected', { 
          balance: balance.balance,
          threshold: this.lowBalanceThreshold
        });
        
        // Send admin alert for low balance
        try {
          await emailService.sendAdminAlert(
            'Low Aggregator Balance Alert',
            'The aggregator account balance is running low.',
            {
              currentBalance: `GHC ${balance.balance}`,
              threshold: `GHC ${this.lowBalanceThreshold}`,
              currency: balance.currencyCode
            }
          );
        } catch (alertError) {
          logger.error('Failed to send low balance alert', { error: alertError.message });
        }
      }

      return balance;
    } catch (error) {
      logger.error('Failed to check balance', { error: error.message });
      throw new Error(`Failed to check balance: ${error.response?.data?.message || error.message}`);
    }
  }

  // Validate phone number for Ghana
  validateGhanaPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if it's a valid Ghana phone number
    // Ghana numbers start with 0 and are 10 digits, or with 233 and are 12 digits
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      // Convert to international format
      return {
        valid: true,
        formatted: '+233' + cleaned.substring(1)
      };
    } else if (cleaned.startsWith('233') && cleaned.length === 12) {
      return {
        valid: true,
        formatted: '+' + cleaned
      };
    } else if (cleaned.startsWith('233') && cleaned.length === 9) {
      // Without the country code prefix
      return {
        valid: true,
        formatted: '+233' + cleaned.substring(3)
      };
    }
    
    return {
      valid: false,
      formatted: phoneNumber
    };
  }
}

module.exports = new AggregatorService();