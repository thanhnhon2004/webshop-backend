const jwt = require('jsonwebtoken');
const TokenBlacklist = require('../models/TokenBlacklist');
const config = require('../config/environment');

const JWT_SECRET = config.jwt.accessSecret;
const JWT_REFRESH_SECRET = config.jwt.refreshSecret;

// Access Token: 15 phút
const ACCESS_TOKEN_EXPIRE = config.jwt.accessExpire;
// Refresh Token: 7 ngày
const REFRESH_TOKEN_EXPIRE = config.jwt.refreshExpire;

/**
 * Tạo Access Token (ngắn hạn)
 */
const generateAccessToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role, type: 'access' },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRE }
  );
};

/**
 * Tạo Refresh Token (dài hạn)
 */
const generateRefreshToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRE }
  );
};

/**
 * Tạo cặp Access + Refresh Token
 */
const generateTokenPair = (userId, email, role) => {
  const accessToken = generateAccessToken(userId, email, role);
  const refreshToken = generateRefreshToken(userId, email, role);
  return { accessToken, refreshToken };
};

/**
 * Verify Access Token
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (err) {
    throw err;
  }
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (err) {
    throw err;
  }
};

/**
 * Thêm token vào blacklist (logout)
 */
const blacklistToken = async (token, expiresAt) => {
  try {
    const payload = jwt.decode(token);
    if (!payload || !payload.userId) {
      throw new Error('Invalid token');
    }

    await TokenBlacklist.create({
      token,
      userId: payload.userId,
      type: 'logout',
      expiresAt: new Date(expiresAt * 1000) // Convert từ unix timestamp
    });
  } catch (err) {
    console.error('Error blacklisting token:', err.message);
  }
};

/**
 * Kiểm tra token có bị blacklist không
 */
const isTokenBlacklisted = async (token) => {
  try {
    const exists = await TokenBlacklist.findOne({ token });
    return !!exists;
  } catch (err) {
    console.error('Error checking blacklist:', err.message);
    return false;
  }
};

/**
 * Logout: blacklist access token + refresh token
 */
const logoutUser = async (accessToken, refreshToken) => {
  try {
    const accessPayload = jwt.decode(accessToken);
    const refreshPayload = jwt.decode(refreshToken);

    const promises = [
      blacklistToken(accessToken, accessPayload.exp),
      blacklistToken(refreshToken, refreshPayload.exp)
    ];

    await Promise.all(promises);
  } catch (err) {
    console.error('Error during logout:', err.message);
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  blacklistToken,
  isTokenBlacklisted,
  logoutUser,
  ACCESS_TOKEN_EXPIRE,
  REFRESH_TOKEN_EXPIRE
};
