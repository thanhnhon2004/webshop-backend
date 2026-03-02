/**
 * Environment Configuration with Validation
 * Đảm bảo tất cả env variables cần thiết đều có giá trị
 */

const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config();

// Required environment variables
const requiredEnvVars = [
  'PORT',
  'NODE_ENV',
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'FE_URL',
  'BASE_URL'
];

/**
 * Validate environment variables
 */
const validateEnvironment = () => {
  const missing = [];

  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  });

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(env => console.error(`   - ${env}`));
    console.error('\n📝 Please check your .env file or copy from .env.example');
    process.exit(1);
  }

  console.log('✅ All required environment variables are present');
};

/**
 * Get environment configuration
 */
const getConfig = () => ({
  // Server
  port: parseInt(process.env.PORT, 10) || 2004,
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Database
  mongoUri: process.env.MONGO_URI,

  // JWT
  jwt: {
    accessSecret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpire: '15m',
    refreshExpire: '7d'
  },

  // CORS
cors: {
  origin: process.env.FE_URL?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
},

  // File Upload
  upload: {
    baseUrl: process.env.BASE_URL || 'http://localhost:2004',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024 // 5MB
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
  }
});

// Validate on load
validateEnvironment();

// Get config
const config = getConfig();

module.exports = config;
