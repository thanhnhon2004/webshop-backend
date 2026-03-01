const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Tạo folder logs nếu chưa có
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Winston Logger Configuration
 * Dùng để log tất cả application events
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
      // Format: [timestamp] [requestId] [level] message
      const req = requestId ? `[${requestId}]` : '';
      const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
      return `${timestamp} ${req} [${level.toUpperCase()}] ${message} ${metaStr}`;
    })
  ),
  defaultMeta: { service: 'api-server' },
  transports: [
    // Console: Log tất cả levels (dev dùng)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
          const req = requestId ? `[${requestId}]` : '';
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} ${req} [${level}] ${message}${metaStr}`;
        })
      )
    }),

    // File: Log tất cả events
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),

    // Error file: Chỉ log errors
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5
    }),

    // Combined file: HTTP requests
    new winston.transports.File({
      filename: path.join(logsDir, 'http.log'),
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

/**
 * Helper function: Log HTTP request
 * Được gọi bởi morgan/middleware
 */
logger.logHttp = (method, url, status, duration, requestId) => {
  const statusColor = status >= 500 ? 'red' : status >= 400 ? 'yellow' : 'green';
  logger.info(`${method} ${url} ${status} ${duration}ms`, { requestId });
};

/**
 * Helper function: Log request dengan metadata
 */
logger.logRequest = (message, meta = {}, requestId = null) => {
  logger.info(message, { ...meta, requestId });
};

/**
 * Helper function: Log error
 */
logger.logError = (message, error = null, requestId = null) => {
  logger.error(message, { error: error?.message || error, stack: error?.stack, requestId });
};

module.exports = logger;
