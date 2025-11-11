const axios = require('axios');
const logger = require('../utils/logger');

class MoMoService {
  constructor() {
    // MTN MoMo API credentials (sandbox)
    this.momoApiUser = process.env.MOMO_API_USER;
    this.momoApiKey = process.env.MOMO_API_KEY;
    this.momoSubscriptionKey = process.env.MOMO_SUBSCRIPTION_KEY;
    this.momoBaseUrl = 'https://sandbox.momodeveloper.mtn.com';
  }

  // Request to pay endpoint
  async requestToPay(phoneNumber, amount, transactionId, payerMessage, payeeNote) {
    try {
      // Get access token
      const token = await this.getAccessToken();
      
      const response = await axios.post(
        `${this.momoBaseUrl}/collection/v1_0/requesttopay`,
        {
          amount: amount.toString(),
          currency: 'EUR', // MTN MoMo sandbox uses EUR
          externalId: transactionId,
          payer: {
            partyIdType: 'MSISDN',
            partyId: phoneNumber
          },
          payerMessage: payerMessage,
          payeeNote: payeeNote
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Reference-Id': transactionId,
            'X-Target-Environment': 'sandbox',
            'Ocp-Apim-Subscription-Key': this.momoSubscriptionKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        status: 'success',
        reference: transactionId,
        data: response.data
      };
    } catch (error) {
      logger.error('MoMo request to pay failed', { error: error.message });
      throw new Error(`MoMo payment request failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get access token
  async getAccessToken() {
    try {
      const response = await axios.post(
        `${this.momoBaseUrl}/collection/token/`,
        {},
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.momoApiUser}:${this.momoApiKey}`).toString('base64')}`,
            'Ocp-Apim-Subscription-Key': this.momoSubscriptionKey
          }
        }
      );

      return response.data.access_token;
    } catch (error) {
      logger.error('MoMo access token request failed', { error: error.message });
      throw new Error(`Failed to get MoMo access token: ${error.response?.data?.message || error.message}`);
    }
  }

  // Check payment status
  async checkPaymentStatus(transactionId) {
    try {
      // Get access token
      const token = await this.getAccessToken();
      
      const response = await axios.get(
        `${this.momoBaseUrl}/collection/v1_0/requesttopay/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Target-Environment': 'sandbox',
            'Ocp-Apim-Subscription-Key': this.momoSubscriptionKey
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('MoMo payment status check failed', { error: error.message, transactionId });
      throw new Error(`Failed to check MoMo payment status: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = new MoMoService();