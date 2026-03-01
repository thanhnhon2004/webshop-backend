const morgan = require('morgan');
const logger = require('../utils/logger');

/**
 * Morgan with Winston Integration
 * Morgan logs HTTP requests, Winston logs to file + console
 */

// Custom token để lấy request-id
morgan.token('requestId', (req) => req.id || 'no-id');

// Custom token để lấy response body size
morgan.token('body-size', (req, res) => {
  return res.get('content-length') || 0;
});

/**
 * Custom morgan format
 * Format: [requestId] METHOD URL STATUS DURATION ms SIZE
 */
const morganFormat = ':requestId :method :url :status :response-time ms - :body-size bytes';

/**
 * Stream to Winston logger
 * Thay vì log ra console, morgan log ra Winston
 */
const morganStream = {
  write: (message) => {
    // Parse message: "[req-123] GET /api/products 200 45 ms - 1024 bytes"
    const matches = message.match(/\[([\w-]+)\]\s+(\w+)\s+(.+?)\s+(\d+)\s+(.+)/);
    if (matches) {
      const [, requestId, method, url, status, rest] = matches;
      logger.info(`HTTP ${method} ${url} ${status}`, {
        requestId,
        method,
        url,
        status: parseInt(status),
        duration: rest
      });
    } else {
      logger.info(message.trim());
    }
  }
};

/**
 * Create morgan middleware
 * Development: Log ra console + file
 * Production: Chỉ log HTTP requests ra file
 */
const createMorganMiddleware = (isDevelopment = false) => {
  return morgan(morganFormat, {
    stream: morganStream,
    skip: (req, res) => {
      // Skip health check endpoints
      if (req.url === '/health' || req.url === '/health/db') {
        return true;
      }
      return false;
    }
  });
};

module.exports = createMorganMiddleware;
