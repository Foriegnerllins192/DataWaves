const twilio = require('twilio');
const logger = require('../utils/logger');

class SMSService {
  constructor() {
    // Twilio credentials
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    
    // Initialize Twilio client if credentials are provided
    if (this.accountSid && this.authToken && this.accountSid.startsWith('AC')) {
      this.client = twilio(this.accountSid, this.authToken);
    } else {
      logger.warn('Twilio credentials not configured or invalid, SMS service will be disabled');
    }
  }

  // Send SMS
  async sendSMS(to, message) {
    // If Twilio is not configured, log the message instead
    if (!this.client) {
      logger.info('SMS service not configured, logging message instead', { 
        to: to, 
        message: message 
      });
      return { sid: 'mock-sid-' + Date.now() };
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to
      });

      logger.info('SMS sent successfully', { 
        messageId: result.sid, 
        to: to,
        message: message
      });

      return result;
    } catch (error) {
      logger.error('Failed to send SMS', { 
        error: error.message,
        to: to,
        message: message
      });
      throw error;
    }
  }

  // Send payment confirmation SMS
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

    return this.sendSMS(to, message);
  }

  // Send admin alert SMS
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

    return this.sendSMS(adminPhone, fullMessage);
  }
}

module.exports = new SMSService();