const logger = require('../utils/logger');

class ValidationService {
  constructor() {
    // Network configuration - extensible for new networks
    this.networkConfig = {
      mtn: {
        name: 'MTN',
        prefixes: ['24', '54', '55', '59'], // MTN Ghana prefixes
        requiredChecks: ['networkMatch', 'phoneFormat', 'activeNumber', 'notBlacklisted'],
        optionalChecks: [], // No optional SIM type checks for MTN data
        allowedSimTypes: ['prepaid', 'postpaid'],
        blockedSimTypes: [], // Don't block any SIM types for data
        errorMessages: {
          wrongNetwork: 'Wrong MTN number',
          inactive: 'MTN number is inactive',
          blacklisted: 'MTN number is blacklisted',
          differentNetwork: 'This number belongs to a different network'
        }
      },
      telecel: {
        name: 'Telecel',
        prefixes: ['20', '50'], // Telecel (Vodafone) Ghana prefixes
        requiredChecks: ['networkMatch', 'phoneFormat', 'activeNumber', 'notBlacklisted'],
        optionalChecks: [],
        allowedSimTypes: ['prepaid', 'postpaid'],
        blockedSimTypes: [],
        errorMessages: {
          wrongNetwork: 'Wrong Telecel number',
          inactive: 'Telecel number is inactive',
          blacklisted: 'Telecel number is blacklisted',
          differentNetwork: 'This number belongs to a different network'
        }
      },
      airteltigo: {
        name: 'AirtelTigo',
        prefixes: ['26', '27', '56', '57'], // AirtelTigo Ghana prefixes
        requiredChecks: ['networkMatch', 'phoneFormat', 'activeNumber', 'notBlacklisted'],
        optionalChecks: [],
        allowedSimTypes: ['airtel_prepaid', 'tigo_prepaid', 'airteltigo_merged'],
        blockedSimTypes: [],
        errorMessages: {
          wrongNetwork: 'Wrong AirtelTigo number',
          inactive: 'AirtelTigo number is inactive',
          blacklisted: 'AirtelTigo number is blacklisted',
          differentNetwork: 'This number belongs to a different network'
        }
      }
    };

    // Global validation rules that apply to ALL networks
    this.globalRules = {
      requiredChecks: ['networkMatch', 'phoneFormat', 'activeNumber', 'notBlacklisted'],
      // These SIM types are NEVER required globally
      neverRequiredGlobally: ['merchant', 'evd', 'turbonet', 'broadband', 'roaming']
    };
  }

  // Main phone number validation with network-specific rules
  async validatePhoneNumberForNetwork(phoneNumber, selectedNetwork) {
    try {
      logger.info(`Validating phone number for ${selectedNetwork} network`, { phoneNumber });

      // Step 1: Basic phone format validation
      const formatValidation = this.validateGhanaPhoneNumber(phoneNumber);
      if (!formatValidation.valid) {
        return {
          valid: false,
          error: formatValidation.error,
          code: 'INVALID_FORMAT'
        };
      }

      // Step 2: Get network configuration
      const networkConfig = this.networkConfig[selectedNetwork.toLowerCase()];
      if (!networkConfig) {
        return {
          valid: false,
          error: 'Unsupported network',
          code: 'UNSUPPORTED_NETWORK'
        };
      }

      // Step 3: Network match validation
      const networkMatch = this.validateNetworkMatch(formatValidation.local, selectedNetwork);
      if (!networkMatch.valid) {
        return {
          valid: false,
          error: networkConfig.errorMessages.differentNetwork,
          code: 'WRONG_NETWORK',
          detectedNetwork: networkMatch.detectedNetwork
        };
      }

      // Step 4: Network-specific validation (only required checks)
      const networkValidation = await this.performNetworkSpecificValidation(
        formatValidation.formatted,
        selectedNetwork,
        networkConfig
      );

      if (!networkValidation.valid) {
        return networkValidation;
      }

      // Success - all required validations passed
      return {
        valid: true,
        phoneNumber: formatValidation.formatted,
        localFormat: formatValidation.local,
        network: selectedNetwork,
        message: `${networkConfig.name} number validated successfully`
      };

    } catch (error) {
      logger.error('Phone validation error:', error);
      return {
        valid: false,
        error: 'Validation service temporarily unavailable',
        code: 'SERVICE_ERROR'
      };
    }
  }

  // Validate Ghana phone number format (global rule)
  validateGhanaPhoneNumber(phoneNumber) {
    // Remove all non-digit characters except +
    const cleaned = phoneNumber.replace(/[^0-9+]/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('+233') && cleaned.length === 12) {
      // +233XXXXXXXXX format
      const prefix = cleaned.substring(4, 6);
      const validPrefixes = ['20', '24', '27', '26', '50', '54', '55', '56', '57', '59'];
      
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
      const validPrefixes = ['20', '24', '27', '26', '50', '54', '55', '56', '57', '59'];
      
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
      const validPrefixes = ['20', '24', '27', '26', '50', '54', '55', '56', '57', '59'];
      
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

  // Validate network match (global rule)
  validateNetworkMatch(localPhoneNumber, selectedNetwork) {
    const prefix = localPhoneNumber.substring(1, 3); // Get prefix from 0XXXXXXXXX
    
    // Detect actual network from prefix
    let detectedNetwork = null;
    for (const [network, config] of Object.entries(this.networkConfig)) {
      if (config.prefixes.includes(prefix)) {
        detectedNetwork = network;
        break;
      }
    }

    if (!detectedNetwork) {
      return {
        valid: false,
        error: 'Unknown network prefix',
        detectedNetwork: 'unknown'
      };
    }

    if (detectedNetwork !== selectedNetwork.toLowerCase()) {
      return {
        valid: false,
        error: 'Network mismatch',
        detectedNetwork
      };
    }

    return {
      valid: true,
      detectedNetwork
    };
  }

  // Perform network-specific validation (only required checks)
  async performNetworkSpecificValidation(phoneNumber, network, networkConfig) {
    const results = {
      valid: true,
      checks: {}
    };

    // Only perform required checks for this network
    for (const checkType of networkConfig.requiredChecks) {
      let checkResult;

      switch (checkType) {
        case 'activeNumber':
          checkResult = await this.checkNumberActive(phoneNumber, network);
          break;
        case 'notBlacklisted':
          checkResult = await this.checkNotBlacklisted(phoneNumber, network);
          break;
        case 'networkMatch':
        case 'phoneFormat':
          // Already validated above
          checkResult = { valid: true };
          break;
        default:
          // Skip unknown check types
          checkResult = { valid: true };
      }

      results.checks[checkType] = checkResult;

      if (!checkResult.valid) {
        return {
          valid: false,
          error: this.getErrorMessage(checkType, network, networkConfig),
          code: checkType.toUpperCase(),
          failedCheck: checkType
        };
      }
    }

    // IMPORTANT: Skip all SIM type validations for data purchases
    // These are explicitly NOT required per your specifications
    logger.info(`Skipping SIM type validations for ${network} data purchase`, {
      skipped: this.globalRules.neverRequiredGlobally
    });

    return results;
  }

  // Check if number is active (mock implementation - replace with actual API)
  async checkNumberActive(phoneNumber, network) {
    try {
      // TODO: Integrate with actual telco API or third-party service
      // For now, simulate active check
      logger.info(`Checking if ${phoneNumber} is active on ${network}`);
      
      // Mock implementation - in production, call actual API
      const isActive = true; // Replace with actual API call
      
      return {
        valid: isActive,
        message: isActive ? 'Number is active' : 'Number is inactive'
      };
    } catch (error) {
      logger.error('Error checking number active status:', error);
      // On API error, allow transaction to proceed (fail-safe approach)
      return {
        valid: true,
        message: 'Active status check unavailable, proceeding'
      };
    }
  }

  // Check if number is blacklisted (mock implementation)
  async checkNotBlacklisted(phoneNumber, network) {
    try {
      // TODO: Check against blacklist database
      logger.info(`Checking if ${phoneNumber} is blacklisted on ${network}`);
      
      // Mock implementation - check your blacklist database
      const isBlacklisted = false; // Replace with actual database check
      
      return {
        valid: !isBlacklisted,
        message: isBlacklisted ? 'Number is blacklisted' : 'Number is not blacklisted'
      };
    } catch (error) {
      logger.error('Error checking blacklist status:', error);
      // On error, allow transaction (fail-safe)
      return {
        valid: true,
        message: 'Blacklist check unavailable, proceeding'
      };
    }
  }

  // Get appropriate error message for failed validation
  getErrorMessage(checkType, network, networkConfig) {
    switch (checkType) {
      case 'activeNumber':
        return networkConfig.errorMessages.inactive;
      case 'notBlacklisted':
        return networkConfig.errorMessages.blacklisted;
      case 'networkMatch':
        return networkConfig.errorMessages.differentNetwork;
      default:
        return `${networkConfig.name} validation failed`;
    }
  }

  // Add new network configuration (extensibility)
  addNetworkConfig(networkKey, config) {
    this.networkConfig[networkKey] = {
      ...config,
      requiredChecks: config.requiredChecks || this.globalRules.requiredChecks
    };
    logger.info(`Added new network configuration: ${networkKey}`);
  }

  // Get supported networks
  getSupportedNetworks() {
    return Object.keys(this.networkConfig);
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
    
    if (!plan.provider || !this.getSupportedNetworks().includes(plan.provider.toLowerCase())) {
      errors.push('Invalid or unsupported provider');
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

  // Validate transaction with network-specific phone validation
  async validateTransaction(transaction) {
    const errors = [];
    
    if (!transaction.user_id || isNaN(parseInt(transaction.user_id))) {
      errors.push('Invalid user ID');
    }
    
    if (!transaction.plan_id || isNaN(parseInt(transaction.plan_id))) {
      errors.push('Invalid plan ID');
    }
    
    if (!transaction.network || !this.getSupportedNetworks().includes(transaction.network.toLowerCase())) {
      errors.push('Invalid or unsupported network');
    }
    
    if (!transaction.phone_number) {
      errors.push('Phone number is required');
    } else if (transaction.network) {
      // Use network-specific validation
      const phoneValidation = await this.validatePhoneNumberForNetwork(
        transaction.phone_number,
        transaction.network
      );
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