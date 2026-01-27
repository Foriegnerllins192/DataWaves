# SMS Phone API Integration Guide

This document explains the SMS Phone API integration that replaced Twilio SMS in the DataWaves mobile data vending application.

## Overview

The application now uses SMS Phone API (https://smsphoneapi.com) instead of Twilio for sending SMS notifications. This change provides:

- Simplified API integration
- Cost-effective SMS delivery
- Reliable message delivery
- Easy configuration

## Configuration

### Environment Variables

Add the following environment variable to your `.env` file:

```env
# SMS Phone API Configuration
SMS_PHONE_API_KEY=your_actual_sms_phone_api_key
```

### Getting Your API Key

1. Visit https://smsphoneapi.com
2. Create an account or log in to your existing account
3. Navigate to your dashboard
4. Copy your API key from the dashboard
5. Replace `your_actual_sms_phone_api_key` in your `.env` file

## SMS Service Implementation

The SMS service is implemented in `services/smsService.js` with the following key features:

### Core Methods

#### `sendSMS(to, message)`
- **Purpose**: Send SMS to any phone number
- **Parameters**: 
  - `to`: Phone number with country code (e.g., +233XXXXXXXXX)
  - `message`: SMS content
- **Returns**: Success/failure status with message ID

#### `sendPaymentConfirmation(to, transaction, user, plan)`
- **Purpose**: Send payment confirmation SMS
- **Usage**: Automatically called after successful payments
- **Content**: Transaction details, amount, reference ID

#### `sendAdminAlert(message, details)`
- **Purpose**: Send alerts to admin phone number
- **Configuration**: Requires `ADMIN_PHONE` environment variable
- **Usage**: System notifications and alerts

## SMS Phone API Integration Details

### API Endpoint
- **URL**: `https://api.smsphoneapi.com/v1/send`
- **Method**: POST
- **Content-Type**: application/json

### Request Format
```json
{
  "key": "your_api_key",
  "phone": "+233XXXXXXXXX",
  "message": "Your SMS message content"
}
```

### Response Format
```json
{
  "success": true,
  "message_id": "unique_message_id",
  "status": "sent",
  "message": "SMS sent successfully"
}
```

## Error Handling

The SMS service includes comprehensive error handling:

1. **Configuration Check**: Validates API key presence
2. **Network Errors**: Handles timeouts and connection issues
3. **API Errors**: Processes SMS Phone API error responses
4. **Graceful Degradation**: Logs messages when SMS is not configured
5. **Detailed Logging**: All SMS operations are logged for debugging

## Usage in Application

### Payment Confirmations
SMS confirmations are sent when:
- User selects SMS as confirmation method during payment
- Payment is successfully processed
- Transaction is completed

### Failure Notifications
SMS failure notifications are sent when:
- Payment fails after user selected SMS confirmation
- Contains error details and support information

### Admin Alerts
Admin SMS alerts can be sent for:
- System errors
- Important notifications
- Custom alerts (requires implementation)

## Testing

### Without API Key
When `SMS_PHONE_API_KEY` is not configured:
- SMS service logs messages instead of sending
- Application continues to function normally
- No SMS charges incurred

### With API Key
When properly configured:
- Real SMS messages are sent via SMS Phone API
- All operations are logged
- Success/failure status is tracked

## Migration from Twilio

The following changes were made during migration:

### Removed
- Twilio SDK dependency (`twilio` package)
- Twilio environment variables:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER`

### Added
- SMS Phone API integration using axios
- New environment variable: `SMS_PHONE_API_KEY`
- Enhanced error handling and logging

### Maintained
- Same SMS service interface
- All existing SMS functionality
- Payment confirmation flow
- Admin alert capability
- Graceful degradation when not configured

## Troubleshooting

### Common Issues

1. **SMS Not Sending**
   - Check if `SMS_PHONE_API_KEY` is set correctly
   - Verify API key is valid on SMS Phone API dashboard
   - Check application logs for error messages

2. **Invalid Phone Numbers**
   - Ensure phone numbers include country code
   - Format: +233XXXXXXXXX (Ghana example)
   - Remove spaces and special characters

3. **API Errors**
   - Check SMS Phone API service status
   - Verify account balance on SMS Phone API dashboard
   - Review error messages in application logs

### Log Messages

Monitor these log messages:
- `SMS Phone API service initialized successfully` - Service ready
- `SMS service not configured` - API key missing
- `SMS sent successfully via SMS Phone API` - Message sent
- `SMS Phone API returned error` - API error occurred

## Security Considerations

1. **API Key Protection**
   - Never commit API keys to version control
   - Use environment variables only
   - Rotate API keys regularly

2. **Phone Number Validation**
   - Validate phone numbers before sending
   - Sanitize user input
   - Implement rate limiting if needed

3. **Message Content**
   - Avoid sensitive information in SMS
   - Keep messages concise and clear
   - Follow SMS best practices

## Support

For SMS Phone API specific issues:
- Visit: https://smsphoneapi.com/support
- Documentation: https://smsphoneapi.com/docs

For application integration issues:
- Check application logs
- Review this documentation
- Test with API key disabled first