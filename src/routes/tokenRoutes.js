const express = require('express');
const router = express.Router();
const { verifyToken, verifyRefreshTokenMiddleware } = require('../middleware/auth');
const { generateTokenPair, logoutUser } = require('../utils/tokenUtils');
const { successResponse } = require('../utils/response');
const { UnauthorizedError } = require('../middleware/errorHandler');

/**
 * POST /api/tokens/refresh
 * Làm mới Access Token bằng Refresh Token
 */
router.post('/refresh', verifyRefreshTokenMiddleware, async (req, res, next) => {
  try {
    const { userId, email, role } = req.user;

    // Tạo cặp token mới
    const { accessToken, refreshToken } = generateTokenPair(userId, email, role);

    successResponse(res, {
      accessToken,
      refreshToken,
      expiresIn: 900 // 15 phút (tính bằng giây)
    }, 'Token refreshed successfully');
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/tokens/logout
 * Logout: blacklist cả access token và refresh token
 */
router.post('/logout', verifyToken, async (req, res, next) => {
  try {
    const accessToken = req.token;
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token required for logout');
    }

    // Blacklist cả hai token
    await logoutUser(accessToken, refreshToken);

    successResponse(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
