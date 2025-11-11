const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '..', 'logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  log(level, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      metadata
    };

    const logMessage = JSON.stringify(logEntry) + '\n';
    const logFile = path.join(this.logDir, `${new Date().toISOString().split('T')[0]}.log`);

    try {
      fs.appendFileSync(logFile, logMessage);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }

    // Also log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, metadata);
    }
  }

  info(message, metadata) {
    this.log('info', message, metadata);
  }

  error(message, metadata) {
    this.log('error', message, metadata);
  }

  warn(message, metadata) {
    this.log('warn', message, metadata);
  }

  debug(message, metadata) {
    this.log('debug', message, metadata);
  }

  // Specialized transaction logging
  transaction(transactionId, action, details = {}) {
    this.log('transaction', `Transaction ${action}`, {
      transactionId,
      action,
      ...details
    });
  }

  // Specialized payment logging
  payment(reference, action, details = {}) {
    this.log('payment', `Payment ${action}`, {
      reference,
      action,
      ...details
    });
  }

  // Specialized aggregator logging
  aggregator(operation, details = {}) {
    this.log('aggregator', `Aggregator ${operation}`, details);
  }
}

module.exports = new Logger();