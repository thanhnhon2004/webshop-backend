const { v4: uuidv4 } = require('uuid');

/**
 * Generate unique request-id for each request
 * Dùng để trace request từ đầu đến cuối
 * 
 * Middleware này:
 * 1. Generate unique ID (UUID)
 * 2. Gán vào req.id (dùng trong controllers)
 * 3. Gán vào header response (client có thể debug)
 * 4. Gán vào locals (dùng trong logger)
 */
const requestIdMiddleware = (req, res, next) => {
  const requestId = `${Date.now()}-${uuidv4().slice(0, 8)}`;
  
  // Gán ID vào request
  req.id = requestId;
  req.requestId = requestId;
  
  // Gán ID vào response headers (client có thể track)
  res.setHeader('X-Request-ID', requestId);
  
  // Gán ID vào res.locals (dùng trong logger)
  res.locals.requestId = requestId;
  
  next();
};

module.exports = requestIdMiddleware;
