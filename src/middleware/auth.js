const { UnauthorizedError, ForbiddenError } = require('./errorHandler');
const { verifyAccessToken, verifyRefreshToken, isTokenBlacklisted } = require('../utils/tokenUtils');

/**
 * Kiểm tra Access Token (chính)
 * Dùng cho: API requests từ frontend
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) throw new UnauthorizedError('No token provided');

    // Kiểm tra có bị blacklist không
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) throw new UnauthorizedError('Token has been revoked');

    // Verify access token
    const payload = verifyAccessToken(token);
    req.user = payload; // { userId, email, role, type: 'access' }
    req.token = token; // Lưu token để dùng khi logout
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Kiểm tra Refresh Token
 * Dùng cho: /refresh-token endpoint
 */
const verifyRefreshTokenMiddleware = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];
    if (!refreshToken) throw new UnauthorizedError('No refresh token provided');

    // Kiểm tra có bị blacklist không
    const blacklisted = await isTokenBlacklisted(refreshToken);
    if (blacklisted) throw new UnauthorizedError('Refresh token has been revoked');

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    req.user = payload;
    req.refreshToken = refreshToken;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Chỉ cho phép role admin
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ForbiddenError('Admin access required'));
  }
  next();
};

/**
 * Middleware: allow access if the path `paramName` equals authenticated userId, or user is admin
 */
const requireSelfOrAdmin = (paramName = 'userId') => (req, res, next) => {
  try {
    const authUserId = req.user?.userId;
    const targetId = req.params?.[paramName];
    if (!authUserId) return next(new UnauthorizedError('Unauthorized'));
    if (authUserId === targetId) return next();
    if (req.user.role === 'admin') return next();
    return next(new ForbiddenError('Access denied'));
  } catch (err) {
    next(err);
  }
};

module.exports = { verifyToken, verifyRefreshTokenMiddleware, requireAdmin, requireSelfOrAdmin };
