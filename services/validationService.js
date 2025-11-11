const logger = require('../utils/logger');

class ValidationService {
  // Validate Ghana phone number
  validateGhanaPhoneNumber(phoneNumber) {
    // Remove all non-digit characters except +
    const cleaned = phoneNumber.replace(/[^0-9+]/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('+233') && cleaned.length === 12) {
      // +233XXXXXXXXX format
      const prefix = cleaned.substring(4, 6);
      const validPrefixes = ['20', '24', '27', '26', '23', '50', '54', '55', '57', '59'];
      
      if (validPrefixes.includes(prefix)) {
        return {
          valid: true,
          formatted: cleaned,
          local: '0' + cleaned.substring(4)
        };
      }
    } else if (cleaned.startsWith('233') && cleaned.length === 12) {
      // 233XXXXXXXXX format
      const prefix = cleaned.substring(3, 5);
      const validPrefixes = ['20', '24', '27', '26', '23', '50', '54', '55', '57', '59'];
      
      if (validPrefixes.includes(prefix)) {
        return {
          valid: true,
          formatted: '+' + cleaned,
          local: '0' + cleaned.substring(3)
        };
      }
    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
      // 0XXXXXXXXX format
      const prefix = cleaned.substring(1, 3);
      const validPrefixes = ['20', '24', '27', '26', '23', '50', '54', '55', '57', '59'];
      
      if (validPrefixes.includes(prefix)) {
        return {
          valid: true,
          formatted: '+233' + cleaned.substring(1),
          local: cleaned
        };
      }
    }
    
    return {
      valid: false,
      formatted: phoneNumber,
      local: phoneNumber,
      error: 'Invalid Ghana phone number format. Please use formats like 024XXXXXXX or +23324XXXXXXX'
    };
  }

  // Validate email address
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      valid: emailRegex.test(email),
      email: email.toLowerCase().trim()
    };
  }

  // Validate password strength
  validatePassword(password) {
    // At least 8 characters, one uppercase, one lowercase, one number
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    const isValid = minLength && hasUpperCase && hasLowerCase && hasNumber;
    
    return {
      valid: isValid,
      errors: [
        !minLength && 'Password must be at least 8 characters long',
        !hasUpperCase && 'Password must contain at least one uppercase letter',
        !hasLowerCase && 'Password must contain at least one lowercase letter',
        !hasNumber && 'Password must contain at least one number'
      ].filter(Boolean)
    };
  }

  // Validate data plan
  validateDataPlan(plan) {
    const errors = [];
    
    if (!plan.provider || !['mtn', 'telecel', 'airteltigo'].includes(plan.provider.toLowerCase())) {
      errors.push('Invalid provider');
    }
    
    if (!plan.size || isNaN(parseFloat(plan.size)) || parseFloat(plan.size) <= 0) {
      errors.push('Invalid data plan size');
    }
    
    if (!plan.price || isNaN(parseFloat(plan.price)) || parseFloat(plan.price) <= 0) {
      errors.push('Invalid price');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Validate transaction
  validateTransaction(transaction) {
    const errors = [];
    
    if (!transaction.user_id || isNaN(parseInt(transaction.user_id))) {
      errors.push('Invalid user ID');
    }
    
    if (!transaction.plan_id || isNaN(parseInt(transaction.plan_id))) {
      errors.push('Invalid plan ID');
    }
    
    if (!transaction.network || !['mtn', 'telecel', 'airteltigo'].includes(transaction.network.toLowerCase())) {
      errors.push('Invalid network');
    }
    
    if (!transaction.phone_number) {
      errors.push('Phone number is required');
    } else {
      const phoneValidation = this.validateGhanaPhoneNumber(transaction.phone_number);
      if (!phoneValidation.valid) {
        errors.push(phoneValidation.error || 'Invalid phone number');
      }
    }
    
    if (!transaction.amount || isNaN(parseFloat(transaction.amount)) || parseFloat(transaction.amount) <= 0) {
      errors.push('Invalid amount');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = new ValidationService();