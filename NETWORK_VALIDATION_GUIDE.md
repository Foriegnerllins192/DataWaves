# Network-Specific Validation System

## Overview

This system implements network-specific validation rules for MTN, Telecel, and AirtelTigo data purchases in Ghana. It follows a **failure-resistant** approach that only validates what's absolutely necessary for successful data delivery.

## Key Principles

### ✅ What We DO Validate (Global Rules)
- **Network Match**: Number belongs to selected network
- **Phone Format**: Valid Ghana phone number format
- **Active Number**: Number is active and can receive data
- **Not Blacklisted**: Number is not on any blacklist

### ❌ What We DON'T Validate (Never Required)
- Merchant SIM status
- EVD SIM status  
- Turbonet SIM status
- Broadband SIM status
- Roaming SIM status (unless explicitly requested)

## Network Configurations

### MTN Ghana
```javascript
{
  prefixes: ['24', '54', '55', '59'],
  requiredChecks: ['networkMatch', 'phoneFormat', 'activeNumber', 'notBlacklisted'],
  allowedSimTypes: ['prepaid', 'postpaid'],
  blockedSimTypes: [] // No SIM types blocked for data
}
```

### Telecel (Vodafone) Ghana
```javascript
{
  prefixes: ['20', '50'],
  requiredChecks: ['networkMatch', 'phoneFormat', 'activeNumber', 'notBlacklisted'],
  allowedSimTypes: ['prepaid', 'postpaid'],
  blockedSimTypes: []
}
```

### AirtelTigo Ghana
```javascript
{
  prefixes: ['26', '27', '56', '57'],
  requiredChecks: ['networkMatch', 'phoneFormat', 'activeNumber', 'notBlacklisted'],
  allowedSimTypes: ['airtel_prepaid', 'tigo_prepaid', 'airteltigo_merged'],
  blockedSimTypes: []
}
```

## Usage Examples

### Basic Phone Validation
```javascript
const validationService = require('./services/validationService');

// Validate MTN number
const result = await validationService.validatePhoneNumberForNetwork(
  '0241234567',
  'mtn'
);

if (result.valid) {
  console.log('✅ Validation passed:', result.message);
  console.log('Formatted number:', result.phoneNumber);
} else {
  console.log('❌ Validation failed:', result.error);
  console.log('Error code:', result.code);
}
```

### Transaction Validation
```javascript
const transaction = {
  user_id: 123,
  plan_id: 456,
  network: 'telecel',
  phone_number: '0201234567',
  amount: 5.00
};

const validation = await validationService.validateTransaction(transaction);

if (validation.valid) {
  // Proceed with payment
  console.log('Transaction is valid');
} else {
  console.log('Validation errors:', validation.errors);
}
```

### Adding New Networks
```javascript
// Add a new network (e.g., Glo Ghana)
validationService.addNetworkConfig('glo', {
  name: 'Glo',
  prefixes: ['23'], // Glo Ghana prefixes
  requiredChecks: ['networkMatch', 'phoneFormat', 'activeNumber', 'notBlacklisted'],
  allowedSimTypes: ['prepaid', 'postpaid'],
  blockedSimTypes: [],
  errorMessages: {
    wrongNetwork: 'Wrong Glo number',
    inactive: 'Glo number is inactive',
    blacklisted: 'Glo number is blacklisted',
    differentNetwork: 'This number belongs to a different network'
  }
});
```

## Error Handling

### Network-Specific Error Messages

**MTN Errors:**
- `"Wrong MTN number"`
- `"MTN number is inactive"`
- `"MTN number is blacklisted"`
- `"This number belongs to a different network"`

**Telecel Errors:**
- `"Wrong Telecel number"`
- `"Telecel number is inactive"`
- `"Telecel number is blacklisted"`
- `"This number belongs to a different network"`

**AirtelTigo Errors:**
- `"Wrong AirtelTigo number"`
- `"AirtelTigo number is inactive"`
- `"AirtelTigo number is blacklisted"`
- `"This number belongs to a different network"`

### Error Codes
- `INVALID_FORMAT`: Phone number format is invalid
- `WRONG_NETWORK`: Number doesn't belong to selected network
- `INACTIVE_NUMBER`: Number is not active
- `BLACKLISTED`: Number is blacklisted
- `SERVICE_ERROR`: Validation service temporarily unavailable

## Integration Points

### 1. Payment Route Integration
```javascript
// In routes/payment.js
const phoneValidation = await validationService.validatePhoneNumberForNetwork(
  phone_number,
  plan.provider
);

if (!phoneValidation.valid) {
  return res.status(400).json({
    error: phoneValidation.error,
    code: phoneValidation.code,
    network: plan.provider
  });
}
```

### 2. Frontend Integration
```javascript
// In frontend JavaScript
async function validatePhoneNumber(phoneNumber, network) {
  try {
    const response = await fetch('/api/validate-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, network })
    });
    
    const result = await response.json();
    
    if (!result.valid) {
      showError(result.error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
}
```

## Fail-Safe Approach

The system is designed to **fail safely**:

1. **API Unavailable**: If external validation APIs are down, transactions proceed
2. **Unknown Errors**: System logs errors but doesn't block valid transactions
3. **Network Detection**: If network can't be detected, user gets helpful error message
4. **SIM Type Checks**: Completely skipped for data purchases

## Benefits

### ✅ Reduced False Failures
- No unnecessary SIM type restrictions
- Only validates delivery-critical factors
- Fail-safe error handling

### ✅ Network-Specific Logic
- Each network has its own validation rules
- Extensible for new networks
- Proper error messages per network

### ✅ Better User Experience
- Clear, network-specific error messages
- Faster validation (fewer checks)
- Higher success rates

### ✅ Maintainable Code
- Configuration-driven validation
- Easy to add new networks
- Centralized validation logic

## Testing

### Test Cases to Implement

1. **Valid Numbers**:
   - MTN: 0241234567, 0541234567
   - Telecel: 0201234567, 0501234567
   - AirtelTigo: 0261234567, 0271234567

2. **Invalid Formats**:
   - Too short: 024123456
   - Too long: 02412345678
   - Invalid prefix: 0221234567

3. **Network Mismatches**:
   - MTN number selected for Telecel
   - Telecel number selected for AirtelTigo

4. **Edge Cases**:
   - API timeouts
   - Blacklisted numbers
   - Inactive numbers

## Production Deployment

### Required Environment Variables
```bash
# Add to .env file
VALIDATION_API_TIMEOUT=5000
VALIDATION_FAIL_SAFE=true
MTN_VALIDATION_API_URL=https://api.mtn.com.gh/validate
TELECEL_VALIDATION_API_URL=https://api.telecel.com.gh/validate
AIRTELTIGO_VALIDATION_API_URL=https://api.airteltigo.com.gh/validate
```

### Monitoring
- Log all validation attempts
- Monitor validation success rates
- Alert on high failure rates
- Track API response times

This system ensures reliable data delivery while minimizing false transaction failures.