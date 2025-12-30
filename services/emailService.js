const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    this.from = process.env.SMTP_FROM || 'no-reply@datawaves.com';
  }

  // Send email
  async sendEmail(to, subject, html, text = '') {
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        text,
        html
      });

      logger.info('Email sent successfully', { 
        messageId: info.messageId, 
        to: to,
        subject: subject
      });

      return info;
    } catch (error) {
      logger.error('Failed to send email', { 
        error: error.message,
        to: to,
        subject: subject
      });
      throw error;
    }
  }

  // Send payment confirmation email
  async sendPaymentConfirmation(to, transaction, user, plan) {
    const subject = 'DataWaves - Payment Confirmation';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #007bff; margin: 0;">DataWaves</h1>
            <p style="color: #666; margin: 10px 0 0;">Mobile Data Purchase Confirmation</p>
          </div>
          
          <div style="padding: 30px; background: white; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #28a745;">Payment Successful!</h2>
            
            <p>Dear ${user.full_name},</p>
            
            <p>Your payment for the data bundle has been processed successfully.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Transaction Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Transaction ID:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${transaction.payment_reference}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Date:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${new Date(transaction.created_at).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Network:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${transaction.network.toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Data Bundle:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${plan.size}GB</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Recipient Phone:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${transaction.phone_number}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Amount Paid:</strong></td>
                  <td style="padding: 8px 0;"><strong>GHC ${parseFloat(transaction.amount).toFixed(2)}</strong></td>
                </tr>
              </table>
            </div>
            
            <p>Your data bundle will be delivered to <strong>${transaction.phone_number}</strong> shortly.</p>
            
            <p>If you have any questions, please contact our support team at support@dataway.com</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
              <p>Thank you for choosing DataWaves!</p>
              <p><small>DataWaves - Your trusted mobile data provider</small></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(to, subject, html);
  }

  // Send admin alert
  async sendAdminAlert(subject, message, details = {}) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      logger.warn('Admin email not configured, skipping admin alert');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Admin Alert</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #dc3545; margin: 0;">DataWaves Admin Alert</h1>
          </div>
          
          <div style="padding: 30px; background: white; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #dc3545;">${subject}</h2>
            
            <p>${message}</p>
            
            ${Object.keys(details).length > 0 ? `
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${Object.entries(details).map(([key, value]) => `
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>${key}:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${value}</td>
                  </tr>
                `).join('')}
              </table>
            </div>
            ` : ''}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
              <p>This is an automated alert from DataWaves system.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(adminEmail, `[DataWaves Alert] ${subject}`, html);
  }
}

module.exports = new EmailService();