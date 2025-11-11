const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');

class PaymentService {
  constructor() {
    this.paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    this.paystackBaseUrl = 'https://api.paystack.co';
  }

  // Initialize a payment transaction
  async initializePayment(email, amount, metadata = {}) {
    try {
      logger.info('Initializing payment', { email, amount, metadata });
      
      const response = await axios.post(
        `${this.paystackBaseUrl}/transaction/initialize`,
        {
          email,
          amount: amount * 100, // Paystack expects amount in kobo
          callback_url: `${process.env.APP_URL}/api/payment/callback`,
          metadata
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('Payment initialized successfully', { reference: response.data.data.reference });
      return response.data;
    } catch (error) {
      logger.error('Payment initialization failed', { error: error.message });
      throw new Error(`Payment initialization failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Verify a payment transaction
  async verifyPayment(reference) {
    try {
      const response = await axios.get(
        `${this.paystackBaseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Payment verification failed', { error: error.message, reference });
      throw new Error(`Payment verification failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Validate webhook signature
  validateWebhookSignature(payload, signature) {
    try {
      const hash = crypto
        .createHmac('sha512', this.paystackSecretKey)
        .update(payload)
        .digest('hex');

      return hash === signature;
    } catch (error) {
      logger.error('Webhook signature validation error', { error: error.message });
      return false;
    }
  }
}

module.exports = new PaymentService();