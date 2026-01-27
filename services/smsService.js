const axios = require('axios');
const logger = require('../utils/logger');

/**
 * SMS Service using SMS Phone API (https://smsphoneapi.com)
 * 
 * This service replaces Twilio SMS functionality with SMS Phone API.
 * To use this service, set the SMS_PHONE_API_KEY environment variable
 * with your SMS Phone API key from https://smsphoneapi.com
 */
class SMSService {
  constructor() {
    // SMS Phone API configuration
    this.apiKey = process.env.SMS_PHONE_API_KEY;
    this.apiUrl = 'https://api.smsphoneapi.com/v1/send';
    
    // Check if SMS Phone API is configured
    if (!this.apiKey || this.apiKey === 'your_sms_phone_api_key') {
      logger.warn('SMS Phone API key not configured, SMS service will be disabled');
      this.isConfigured = false;
    } else {
      this.isConfigured = true;
      logger.info('SMS Phone API service initialized successfully');
    }
  }

  /**
   * Send SMS using SMS Phone API
   * @param {string} to - Phone number (with country code, e.g., +233XXXXXXXXX)
   * @param {string} message - SMS message content
   * @returns {Object} Response object with success status
   */
  async sendSMS(to, message) {
    // If SMS Phone API is not configured, log the message instead
    if (!this.isConfigured) {
      logger.info('SMS service not configured, logging message instead', { 
        to: to, 
        message: message 
      });
      return { 
        success: true, 
        messageId: 'mock-id-' + Date.now(),
        status: 'logged' 
      };
    }

    try {
      // Prepare SMS Phone API request
      const requestData = {
        key: this.apiKey,
        phone: to,
        message: message
      };

      // Send SMS via SMS Phone API
      const response = await axios.post(this.apiUrl, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      // Check if SMS was sent successfully
      if (response.data && response.data.success) {
        logger.info('SMS sent successfully via SMS Phone API', { 
          messageId: response.data.message_id || 'unknown', 
          to: to,
          status: response.data.status || 'sent'
        });

        return {
          success: true,
          messageId: response.data.message_id,
          status: response.data.status,
          response: response.data
        };
      } else {
        // SMS Phone API returned error
        const errorMsg = response.data?.message || 'Unknown error from SMS Phone API';
        logger.error('SMS Phone API returned error', { 
          error: errorMsg,
          to: to,
          response: response.data
        });
        
        throw new Error(`SMS Phone API error: ${errorMsg}`);
      }

    } catch (error) {
      // Handle network errors, timeouts, or API errors
      if (error.response) {
        // API responded with error status
        logger.error('SMS Phone API request failed', { 
          status: error.response.status,
          error: error.response.data?.message || error.message,
          to: to
        });
      } else if (error.request) {
        // Network error
        logger.error('SMS Phone API network error', { 
          error: 'Network timeout or connection failed',
          to: to
        });
      } else {
        // Other error
        logger.error('SMS sending failed', { 
          error: error.message,
          to: to
        });
      }
      
      throw error;
    }
  }

  /**
   * Send payment confirmation SMS
   * @param {string} to - Phone number
   * @param {Object} transaction - Transaction object
   * @param {Object} user - User object
   * @param {Object} plan - Data plan object
   */
  async sendPaymentConfirmation(to, transaction, user, plan) {
    const message = `
DataWaves Payment Confirmation

Dear ${user.full_name},
Your payment of GHC ${parseFloat(transaction.amount).toFixed(2)} for ${plan.size}GB ${transaction.network.toUpperCase()} data has been processed successfully.

Transaction ID: ${transaction.payment_reference}
Date: ${new Date(transaction.created_at).toLocaleString()}

Your data bundle will be delivered shortly.

Thank you for choosing DataWaves!
    `;

    return this.sendSMS(to, message.trim());
  }

  /**
   * Send admin alert SMS
   * @param {string} message - Alert message
   * @param {Object} details - Additional details object
   */
  async sendAdminAlert(message, details = {}) {
    const adminPhone = process.env.ADMIN_PHONE;
    if (!adminPhone) {
      logger.warn('Admin phone not configured, skipping admin SMS alert');
      return;
    }

    const fullMessage = `
DataWaves Admin Alert

${message}

${Object.keys(details).map(key => `${key}: ${details[key]}`).join('\n')}

Time: ${new Date().toLocaleString()}
    `;

    return this.sendSMS(adminPhone, fullMessage.trim());
  }
}

module.exports = new SMSService();