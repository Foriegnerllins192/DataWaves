const express = require('express');
const validationService = require('../services/validationService');
const logger = require('../utils/logger');

const router = express.Router();

// Validate phone number for specific network
router.post('/phone', async (req, res) => {
  try {
    const { phoneNumber, network } = req.body;

    if (!phoneNumber || !network) {
      return res.status(400).json({
        valid: false,
        error: 'Phone number and network are required',
        code: 'MISSING_FIELDS'
      });
    }

    logger.info('Phone validation request', {
      phoneNumber: phoneNumber.replace(/\d(?=\d{4})/g, '*'), // Mask phone number in logs
      network,
      ip: req.ip
    });

    const result = await validationService.validatePhoneNumberForNetwork(
      phoneNumber,
      network
    );

    // Log validation result (without sensitive data)
    logger.info('Phone validation result', {
      valid: result.valid,
      network,
      code: result.code || 'SUCCESS',
      ip: req.ip
    });

    res.json(result);

  } catch (error) {
    logger.error('Phone validation error:', error);
    res.status(500).json({
      valid: false,
      error: 'Validation service temporarily unavailable',
      code: 'SERVICE_ERROR'
    });
  }
});

// Get supported networks
router.get('/networks', (req, res) => {
  try {
    const networks = validationService.getSupportedNetworks();
    const networkDetails = {};

    networks.forEach(network => {
      const config = validationService.networkConfig[network];
      networkDetails[network] = {
        name: config.name,
        prefixes: config.prefixes
      };
    });

    res.json({
      success: true,
      networks: networkDetails
    });

  } catch (error) {
    logger.error('Error getting supported networks:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to fetch network information'
    });
  }
});

// Validate transaction data
router.post('/transaction', async (req, res) => {
  try {
    const transactionData = req.body;

    logger.info('Transaction validation request', {
      network: transactionData.network,
      hasPhoneNumber: !!transactionData.phone_number,
      ip: req.ip
    });

    const result = await validationService.validateTransaction(transactionData);

    logger.info('Transaction validation result', {
      valid: result.valid,
      errorCount: result.errors ? result.errors.length : 0,
      ip: req.ip
    });

    res.json(result);

  } catch (error) {
    logger.error('Transaction validation error:', error);
    res.status(500).json({
      valid: false,
      errors: ['Validation service temporarily unavailable']
    });
  }
});

module.exports = router;