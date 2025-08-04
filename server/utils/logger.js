const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define different log formats
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define file format (without colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: logFormat,
  }),
  
  // Error log file
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/error.log'),
    level: 'error',
    format: fileFormat,
  }),
  
  // Combined log file
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/combined.log'),
    format: fileFormat,
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format: fileFormat,
  transports,
  exitOnError: false,
});

// Create a stream object for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Helper functions for structured logging
const logHelpers = {
  // Log user actions
  userAction(userId, action, details = {}) {
    logger.info('User action', {
      userId,
      action,
      details,
      timestamp: new Date().toISOString(),
    });
  },

  // Log agent actions
  agentAction(agentType, action, confidence, details = {}) {
    logger.info('Agent action', {
      agentType,
      action,
      confidence,
      details,
      timestamp: new Date().toISOString(),
    });
  },

  // Log performance metrics
  performance(metric, value, context = {}) {
    logger.info('Performance metric', {
      metric,
      value,
      context,
      timestamp: new Date().toISOString(),
    });
  },

  // Log security events
  security(event, userId = null, details = {}) {
    logger.warn('Security event', {
      event,
      userId,
      details,
      timestamp: new Date().toISOString(),
    });
  },

  // Log database operations
  database(operation, table, duration, rows = null) {
    logger.debug('Database operation', {
      operation,
      table,
      duration,
      rows,
      timestamp: new Date().toISOString(),
    });
  },

  // Log API requests
  apiRequest(method, path, statusCode, duration, userId = null) {
    const level = statusCode >= 400 ? 'warn' : 'info';
    logger[level]('API request', {
      method,
      path,
      statusCode,
      duration,
      userId,
      timestamp: new Date().toISOString(),
    });
  },

  // Log errors with context
  error(message, error, context = {}) {
    logger.error('Application error', {
      message,
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });
  },
};

module.exports = {
  logger,
  logHelpers,
}; 