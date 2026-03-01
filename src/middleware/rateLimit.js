const rateLimit = require('express-rate-limit');

// 🔴 Strict: Login/Register (chặn brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Max 5 lần/IP
  message: 'Quá nhiều lần đăng nhập/đăng ký. Hãy thử lại sau 15 phút',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Chỉ count lần thất bại
});

// 🟡 Normal: API chung (2000 request/15 phút)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: 'Quá nhiều request. Vui lòng thử lại sau',
  standardHeaders: true,
  legacyHeaders: false,
});

// 🟢 Loose: GET requests (5000 request/15 phút)
const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  skip: (req) => req.method !== 'GET', // Chỉ apply cho GET
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, authLimiter, readLimiter };
