const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
// Load environment configuration
const config = require('./config/environment');
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimit');
const { errorHandler } = require('./middleware/errorHandler');
const requestIdMiddleware = require('./middleware/requestId');
const createMorganMiddleware = require('./middleware/morganWinston');
const logger = require('./utils/logger');
const app = express();
// ===== MIDDLEWARE =====
// Nới lỏng CSP cho img-src và connect-src để FE truy cập ảnh và API
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:', config.cors.origin, config.upload.baseUrl],
      connectSrc: ["'self'", config.cors.origin, config.upload.baseUrl],
      scriptSrc: ["'self'", 'unsafe-inline', config.cors.origin],
      styleSrc: ["'self'", 'unsafe-inline', config.cors.origin],
      fontSrc: ["'self'", 'data:', config.cors.origin],
      objectSrc: ["'none'"]
    }
  }
}));
// Request ID middleware (phải là đầu tiên)
app.use(requestIdMiddleware);
// CORS: Chỉ cho phép FE từ config (chỉ dùng 1 lần, không lặp lại)
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://webshop-fontend.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Đáp ứng preflight cho mọi route (nếu FE dùng fetch với credentials)
// ĐÃ XÓA do gây lỗi path-to-regexp, CORS đã được xử lý đủ với app.use(cors(...))
app.use(express.json());
// Morgan logging với Winston
app.use(createMorganMiddleware(config.isDevelopment));
// Serve static files (ảnh, tài liệu)
// Thêm CORS header cho static file /uploads
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', config.cors.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
}, express.static(path.join(__dirname, '../uploads')));
// Kiểm tra đường dẫn thực tế của static file uploads/products
const uploadsProductsPath = path.join(__dirname, 'uploads/products');
console.log('Static uploads/products path:', uploadsProductsPath);
app.use('/uploads/products', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', config.cors.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(uploadsProductsPath));
// Rate-limit: Chỉ apply cho /api khi không phải dev
if (!config.isDevelopment) {
  app.use('/api', apiLimiter);
}
// ===== DATABASE CONNECTION =====
connectDB();
// ===== ROUTES =====
const userRoutes = require('./routes/userRoutes');
const tokenRoutes = require('./routes/tokenRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const shippingRoutes = require('./routes/shippingRoutes');
// API Routes
app.use('/api/users', userRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/shipping', shippingRoutes);
// ===== TEST ROUTES =====
app.get('/', (req, res) => {
  res.send('<h1>🎮 LOL Figures Store API - Running</h1><p>Made by Thanh Nhon</p>');
});
app.get('/health/db', (req, res) => {
  const state = ['disconnected', 'connected', 'connecting', 'disconnecting']
    [require('mongoose').connection.readyState];
  res.json({ mongoState: state });
});
// ===== ERROR HANDLING =====
app.use(errorHandler);
// ===== START SERVER =====
app.listen(config.port, () => {
  logger.info(`🚀 Server running at http://localhost:${config.port}/`);
  logger.info(`📝 Environment: ${config.env}`);
});