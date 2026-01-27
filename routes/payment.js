const express = require('express');
const paymentService = require('../services/paymentService');
const momoService = require('../services/momoService');
const aggregatorService = require('../services/aggregatorService');
const validationService = require('../services/validationService');
const DataPlan = require('../models/DataPlan');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Initialize payment
router.post('/initialize', async (req, res) => {
  try {
    if (!req.session.user) {
      logger.warn('Payment initialization attempt without authentication', { 
        ip: req.ip, 
        userAgent: req.get('User-Agent') 
      });
      return res.status(401).json({ error: 'Authentication required' });
    }

    let { plan_id, phone_number, payment_method } = req.body;

    // Validate required fields
    if (!plan_id || !phone_number) {
      return res.status(400).json({ error: 'Plan ID and phone number are required' });
    }

    // Force Paystack as the only payment method
    payment_method = 'paystack';
    
    // Set automatic notifications to both SMS and email
    const confirmation_method = 'both';
    const confirmation_contact = phone_number; // Use phone for SMS

    logger.info('Payment initialization started', {
      userId: req.session.user.id,
      planId: plan_id,
      phoneNumber: phone_number,
      paymentMethod: payment_method,
      confirmationMethod: confirmation_method
    });

    // Get plan details
    const plan = await DataPlan.getById(plan_id);
    if (!plan) {
      logger.warn('Payment initialization failed - plan not found', { planId: plan_id });
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Get user details
    const user = await User.findById(req.session.user.id);
    if (!user) {
      logger.error('Payment initialization failed - user not found', { userId: req.session.user.id });
      return res.status(404).json({ error: 'User not found' });
    }

    // NETWORK-SPECIFIC PHONE VALIDATION
    logger.info('Starting network-specific phone validation', {
      phoneNumber: phone_number,
      network: plan.provider,
      userId: user.id
    });

    const phoneValidation = await validationService.validatePhoneNumberForNetwork(
      phone_number,
      plan.provider
    );

    if (!phoneValidation.valid) {
      logger.warn('Phone validation failed', {
        phoneNumber: phone_number,
        network: plan.provider,
        error: phoneValidation.error,
        code: phoneValidation.code,
        userId: user.id
      });

      return res.status(400).json({
        error: phoneValidation.error,
        code: phoneValidation.code,
        network: plan.provider,
        detectedNetwork: phoneValidation.detectedNetwork
      });
    }

    logger.info('Phone validation successful', {
      phoneNumber: phoneValidation.phoneNumber,
      network: phoneValidation.network,
      userId: user.id
    });

    // Use validated phone number format
    phone_number = phoneValidation.phoneNumber;

    // Handle Paystack payment (only option)
    const paymentData = {
      email: user.email,
      amount: plan.customer_price || plan.price,
      metadata: {
        user_id: user.id,
        plan_id: plan.id,
        phone_number: phone_number,
        network: plan.provider,
        confirmation_method: confirmation_method,
        confirmation_contact: confirmation_contact,
        user_email: user.email // Store user email for notifications
      }
    };

    const paymentResponse = await paymentService.initializePayment(
      user.email,
      plan.customer_price || plan.price,
      paymentData.metadata
    );

    if (paymentResponse.status) {
      // Create a pending transaction
      const transactionData = {
        user_id: user.id,
        plan_id: plan.id,
        network: plan.provider,
        phone_number: phone_number,
        amount: plan.customer_price || plan.price,
        status: 'pending',
        payment_reference: paymentResponse.data.reference,
        confirmation_method: confirmation_method,
        confirmation_contact: confirmation_contact
      };

      const transactionId = await Transaction.create(transactionData);
      
      logger.transaction(paymentResponse.data.reference, 'created', {
        userId: user.id,
        planId: plan.id,
        network: plan.provider,
        amount: plan.customer_price || plan.price
      });

      logger.payment(paymentResponse.data.reference, 'paystack_initialized', {
        userId: user.id,
        amount: plan.customer_price || plan.price,
        email: user.email
      });

      res.json({
        success: true,
        payment_method: 'paystack',
        payment_url: paymentResponse.data.authorization_url,
        reference: paymentResponse.data.reference
      });
    } else {
      logger.error('Paystack payment initialization failed', {
        error: paymentResponse.message,
        userId: user.id
      });
      res.status(400).json({ error: paymentResponse.message || 'Payment initialization failed' });
    }
  } catch (error) {
    logger.error('Payment initialization error', { 
      error: error.message,
      stack: error.stack,
      userId: req.session.user?.id
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Payment callback endpoint (Paystack redirects here after payment)
router.get('/callback', async (req, res) => {
  try {
    const { reference } = req.query;

    if (!reference) {
      logger.warn('Payment callback called without reference');
      return res.status(400).send('No reference provided');
    }

    logger.info('Payment callback received', { reference });

    // Verify payment
    const verification = await paymentService.verifyPayment(reference);

    if (verification.status && verification.data.status === 'success') {
      logger.payment(reference, 'paystack_verified_success', {
        transactionId: verification.data.id,
        amount: verification.data.amount
      });
      
      // Update transaction status
      await handleSuccessfulPayment(verification.data);
      
      // Redirect to success page with transaction details
      res.redirect('/payment-success.html?reference=' + reference);
    } else {
      logger.payment(reference, 'paystack_verified_failed', {
        verification: verification.data
      });
      
      // Payment failed
      await handleFailedPayment({ reference: reference });
      res.redirect('/payment-failed.html?reference=' + reference);
    }
  } catch (error) {
    logger.error('Payment callback error', { 
      error: error.message,
      reference: req.query.reference
    });
    res.status(500).send('Payment verification failed');
  }
});

// Webhook endpoint (Paystack sends notifications here)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-paystack-signature'];
    
    if (!paymentService.validateWebhookSignature(req.body, signature)) {
      logger.warn('Invalid webhook signature', { 
        signature: signature,
        ip: req.ip 
      });
      return res.status(400).send('Invalid signature');
    }

    const event = JSON.parse(req.body);
    
    logger.info('Webhook event received', { 
      event: event.event,
      data: event.data 
    });

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        logger.payment(event.data.reference, 'paystack_webhook_success', event.data);
        await handleSuccessfulPayment(event.data);
        break;
      case 'charge.failed':
        logger.payment(event.data.reference, 'paystack_webhook_failed', event.data);
        await handleFailedPayment(event.data);
        break;
      default:
        logger.info('Unhandled webhook event type', { event: event.event });
    }

    res.sendStatus(200);
  } catch (error) {
    logger.error('Webhook error', { 
      error: error.message,
      body: req.body.toString()
    });
    res.status(500).send('Webhook processing failed');
  }
});

// MoMo payment status check endpoint
router.get('/momo-status/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    logger.info('MoMo status check requested', { transactionId });
    
    const status = await momoService.checkPaymentStatus(transactionId);
    
    logger.payment(transactionId, 'momo_status_checked', status);
    
    // Update transaction based on status
    if (status.status === 'SUCCESSFUL') {
      const transaction = await Transaction.getByReference(transactionId);
      if (transaction && transaction.status === 'pending') {
        await handleSuccessfulPayment({ reference: transactionId });
        logger.payment(transactionId, 'momo_payment_success');
        res.json({ status: 'success', message: 'Payment successful' });
        return;
      }
    } else if (status.status === 'FAILED') {
      await handleFailedPayment({ reference: transactionId });
      logger.payment(transactionId, 'momo_payment_failed');
      res.json({ status: 'failed', message: 'Payment failed' });
      return;
    }
    
    res.json({ status: status.status, message: 'Payment status checked' });
  } catch (error) {
    logger.error('MoMo status check error', { 
      error: error.message,
      transactionId: req.params.transactionId
    });
    res.status(500).json({ error: 'Status check failed' });
  }
});

// Resend receipt endpoint
router.post('/resend-receipt', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { reference } = req.body;
    
    if (!reference) {
      return res.status(400).json({ error: 'Transaction reference is required' });
    }

    // Get transaction details
    const transaction = await Transaction.getByReference(reference);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check if user is authorized to resend receipt
    if (transaction.user_id !== req.session.user.id && req.session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get plan and user details
    const plan = await DataPlan.getById(transaction.plan_id);
    const user = await User.findById(transaction.user_id);
    
    if (!plan || !user) {
      return res.status(404).json({ error: 'Transaction details not found' });
    }

    // Send confirmation based on user's preference
    if (transaction.confirmation_method === 'email' && transaction.confirmation_contact) {
      await emailService.sendPaymentConfirmation(
        transaction.confirmation_contact,
        transaction,
        user,
        plan
      );
      logger.info('Receipt resent via email', { 
        reference: reference, 
        email: transaction.confirmation_contact 
      });
    } else if (transaction.confirmation_method === 'sms' && transaction.confirmation_contact) {
      await smsService.sendPaymentConfirmation(
        transaction.confirmation_contact,
        transaction,
        user,
        plan
      );
      logger.info('Receipt resent via SMS', { 
        reference: reference, 
        phone: transaction.confirmation_contact 
      });
    } else {
      return res.status(400).json({ error: 'No confirmation method available for this transaction' });
    }

    res.json({ 
      success: true, 
      message: `Receipt resent via ${transaction.confirmation_method}` 
    });
  } catch (error) {
    logger.error('Error resending receipt', { 
      error: error.message,
      reference: req.body.reference
    });
    res.status(500).json({ error: 'Failed to resend receipt' });
  }
});

// Handle successful payment
async function handleSuccessfulPayment(data) {
  try {
    const reference = data.reference;
    logger.info('Processing successful payment', { reference });
    
    // Find transaction by reference
    const transaction = await Transaction.getByReference(reference);
    if (!transaction) {
      logger.error('Transaction not found for reference', { reference });
      return;
    }

    // Update transaction status to 'paid'
    await Transaction.updateStatus(reference, 'paid');
    logger.transaction(reference, 'status_updated', { status: 'paid' });
    
    // Get plan details
    const plan = await DataPlan.getById(transaction.plan_id);
    if (!plan) {
      logger.error('Plan not found for transaction', { transaction_id: transaction.id });
      return;
    }
    
    // Get user details
    const user = await User.findById(transaction.user_id);
    if (!user) {
      logger.error('User not found for transaction', { transaction_id: transaction.id });
      return;
    }

    // Call aggregatorService.topup() to deliver the data
    const operatorId = aggregatorService.getOperatorId(transaction.network);
    if (!operatorId) {
      logger.error('Operator ID not found for network', { network: transaction.network });
      await Transaction.updateStatus(reference, 'failed');
      logger.transaction(reference, 'status_updated', { status: 'failed', reason: 'operator_id_not_found' });
      
      // Send admin alert for failed transaction
      try {
        await emailService.sendAdminAlert(
          'Transaction Failed - Operator ID Not Found',
          'A transaction failed because the operator ID could not be found.',
          {
            transactionId: reference,
            network: transaction.network,
            userId: user.id,
            amount: transaction.amount
          }
        );
      } catch (alertError) {
        logger.error('Failed to send admin alert', { error: alertError.message });
      }
      
      return;
    }
    
    try {
      logger.aggregator('topup_initiated', {
        transactionId: reference,
        phoneNumber: transaction.phone_number,
        operatorId: operatorId,
        amount: parseFloat(transaction.amount)
      });
      
      const topupResponse = await aggregatorService.topup(
        transaction.phone_number,
        operatorId,
        parseFloat(transaction.amount)
      );
      
      logger.aggregator('topup_success', {
        transactionId: reference,
        response: topupResponse
      });
      
      // Update transaction with aggregator response
      await Transaction.updateAggregatorResponse(reference, topupResponse);
      
      // Update transaction status to 'success'
      await Transaction.updateStatus(reference, 'success');
      logger.transaction(reference, 'status_updated', { status: 'success' });
      
      // Send confirmation message
      await sendConfirmationMessage(user, transaction, plan, topupResponse);
      
      logger.info('Payment processed successfully', { reference });
    } catch (aggregatorError) {
      logger.error('Aggregator topup failed', { 
        error: aggregatorError.message, 
        reference: reference 
      });
      
      // Update transaction status to 'failed'
      await Transaction.updateStatus(reference, 'failed');
      logger.transaction(reference, 'status_updated', { status: 'failed', reason: 'aggregator_error' });
      
      // Send failure notification
      await sendFailureNotification(user, transaction, aggregatorError.message);
      
      // Send admin alert for aggregator failure
      try {
        await emailService.sendAdminAlert(
          'Transaction Failed - Aggregator Error',
          'A transaction failed due to an aggregator error.',
          {
            transactionId: reference,
            network: transaction.network,
            userId: user.id,
            amount: transaction.amount,
            error: aggregatorError.message
          }
        );
      } catch (alertError) {
        logger.error('Failed to send admin alert', { error: alertError.message });
      }
    }
  } catch (error) {
    logger.error('Error handling successful payment', { 
      error: error.message,
      reference: data.reference
    });
  }
}

// Handle failed payment
async function handleFailedPayment(data) {
  try {
    const reference = data.reference;
    logger.info('Processing failed payment', { reference });
    
    // Update transaction status to 'failed'
    await Transaction.updateStatus(reference, 'failed');
    logger.transaction(reference, 'status_updated', { status: 'failed' });
    
    // Get transaction details for notification
    const transaction = await Transaction.getByReference(reference);
    if (transaction) {
      const user = await User.findById(transaction.user_id);
      if (user) {
        await sendFailureNotification(user, transaction, 'Payment failed');
        
        // Send admin alert for payment failure
        try {
          await emailService.sendAdminAlert(
            'Payment Failed',
            'A payment transaction failed.',
            {
              transactionId: reference,
              network: transaction.network,
              userId: user.id,
              amount: transaction.amount
            }
          );
        } catch (alertError) {
          logger.error('Failed to send admin alert', { error: alertError.message });
        }
      }
    }
    
    logger.info('Payment failed processed', { reference });
  } catch (error) {
    logger.error('Error handling failed payment', { 
      error: error.message,
      reference: data.reference
    });
  }
}

// Send confirmation message (SMS or Email)
async function sendConfirmationMessage(user, transaction, plan, topupResponse) {
  try {
    logger.info('Sending confirmation messages', {
      userId: user.id,
      transactionId: transaction.payment_reference,
      method: transaction.confirmation_method
    });
    
    // Always send both SMS and email notifications
    let smsSuccess = false;
    let emailSuccess = false;
    
    // Send SMS confirmation
    try {
      await smsService.sendPaymentConfirmation(
        transaction.confirmation_contact || transaction.phone_number,
        transaction,
        user,
        plan
      );
      smsSuccess = true;
      logger.info('SMS confirmation sent successfully', { 
        phoneNumber: transaction.confirmation_contact || transaction.phone_number,
        transactionId: transaction.payment_reference
      });
    } catch (smsError) {
      logger.error('SMS confirmation failed', { 
        error: smsError.message,
        phoneNumber: transaction.confirmation_contact || transaction.phone_number,
        transactionId: transaction.payment_reference
      });
    }
    
    // Send Email confirmation
    try {
      await emailService.sendPaymentConfirmation(
        user.email,
        transaction,
        user,
        plan
      );
      emailSuccess = true;
      logger.info('Email confirmation sent successfully', { 
        email: user.email,
        transactionId: transaction.payment_reference
      });
    } catch (emailError) {
      logger.error('Email confirmation failed', { 
        error: emailError.message,
        email: user.email,
        transactionId: transaction.payment_reference
      });
    }
    
    // Log overall success
    if (smsSuccess || emailSuccess) {
      logger.info('At least one confirmation method succeeded', {
        smsSuccess,
        emailSuccess,
        transactionId: transaction.payment_reference
      });
    } else {
      logger.warn('All confirmation methods failed', {
        transactionId: transaction.payment_reference
      });
    }
    
  } catch (error) {
    logger.error('Error sending confirmation messages', { 
      error: error.message,
      transactionId: transaction.payment_reference
    });
  }
}

// Send failure notification
async function sendFailureNotification(user, transaction, errorMessage) {
  try {
    logger.info('Sending failure notifications', {
      userId: user.id,
      transactionId: transaction.payment_reference
    });
    
    // Always send both SMS and email failure notifications
    let smsSuccess = false;
    let emailSuccess = false;
    
    // Send SMS failure notification
    try {
      const smsMessage = `
DataWaves - Transaction Failed

Dear ${user.full_name},
Your payment for ${transaction.network.toUpperCase()} data bundle failed.

Transaction ID: ${transaction.payment_reference}
Amount: GHC ${parseFloat(transaction.amount).toFixed(2)}
Error: ${errorMessage}

Please try again or contact support@datawaves.com

Thank you for choosing DataWaves!
      `;
      
      await smsService.sendSMS(transaction.confirmation_contact || transaction.phone_number, smsMessage.trim());
      smsSuccess = true;
      logger.info('SMS failure notification sent', { 
        phoneNumber: transaction.confirmation_contact || transaction.phone_number,
        transactionId: transaction.payment_reference
      });
    } catch (smsError) {
      logger.error('SMS failure notification failed', { 
        error: smsError.message,
        phoneNumber: transaction.confirmation_contact || transaction.phone_number,
        transactionId: transaction.payment_reference
      });
    }
    
    // Send Email failure notification
    try {
      const subject = 'DataWaves - Transaction Failed';
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Transaction Failed</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #dc3545; margin: 0;">DataWaves</h1>
              <p style="color: #666; margin: 10px 0 0;">Transaction Failed</p>
            </div>
            
            <div style="padding: 30px; background: white; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
              <h2 style="color: #dc3545;">Transaction Failed</h2>
              
              <p>Dear ${user.full_name},</p>
              
              <p>We're sorry, but your payment for the data bundle has failed.</p>
              
              <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; color: #721c24;">
                <h3 style="margin-top: 0;">Transaction Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f5c6cb;"><strong>Transaction ID:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f5c6cb;">${transaction.payment_reference}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f5c6cb;"><strong>Network:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f5c6cb;">${transaction.network.toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f5c6cb;"><strong>Amount:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f5c6cb;">GHC ${parseFloat(transaction.amount).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Error:</strong></td>
                    <td style="padding: 8px 0;">${errorMessage}</td>
                  </tr>
                </table>
              </div>
              
              <p>Please try again or contact our support team at support@datawaves.com if you continue to experience issues.</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
                <p>Thank you for choosing DataWaves!</p>
                <p><small>DataWaves - Your trusted mobile data provider</small></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      
      await emailService.sendEmail(user.email, subject, html);
      emailSuccess = true;
      logger.info('Email failure notification sent', { 
        email: user.email,
        transactionId: transaction.payment_reference
      });
    } catch (emailError) {
      logger.error('Email failure notification failed', { 
        error: emailError.message,
        email: user.email,
        transactionId: transaction.payment_reference
      });
    }
    
    // Log overall success
    if (smsSuccess || emailSuccess) {
      logger.info('At least one failure notification method succeeded', {
        smsSuccess,
        emailSuccess,
        transactionId: transaction.payment_reference
      });
    } else {
      logger.warn('All failure notification methods failed', {
        transactionId: transaction.payment_reference
      });
    }
    
  } catch (error) {
    logger.error('Error sending failure notifications', { 
      error: error.message,
      transactionId: transaction.payment_reference
    });
  }
}

module.exports = router;