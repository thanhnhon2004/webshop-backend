/**
 * Authentication Tests
 * Tests for register, login, refresh token, logout
 */

const request = require('supertest');
const express = require('express');
const { connectDB, disconnectDB, clearDatabase } = require('./setup');
const { createTestUser, createAuthenticatedUser, generateTestTokens } = require('./helpers');
const userRoutes = require('../src/routes/userRoutes');
const tokenRoutes = require('../src/routes/tokenRoutes');
const User = require('../src/models/User');
const TokenBlacklist = require('../src/models/TokenBlacklist');
const helmet = require('helmet');
const cors = require('cors');
const { errorHandler } = require('../src/middleware/errorHandler');

// Setup test app
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/tokens', tokenRoutes);
app.use(errorHandler);

// Test Suite
describe('Authentication Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          email: 'newuser@example.com',
          password: 'Password@123456',
          confirmPassword: 'Password@123456',
          name: 'New User',
          phone: '0987654321',
          address: 'Test Address'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.email).toBe('newuser@example.com');
    });

    it('should fail on duplicate email', async () => {
      await createTestUser({ email: 'existing@example.com' });

      const res = await request(app)
        .post('/api/users/register')
        .send({
          email: 'existing@example.com',
          password: 'Password@123456',
          confirmPassword: 'Password@123456',
          name: 'Another User',
          phone: '0987654321',
          address: 'Test Address'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('USER_ALREADY_EXISTS');
    });

    it('should fail on password mismatch', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          email: 'newuser@example.com',
          password: 'Password@123456',
          confirmPassword: 'DifferentPassword@123456',
          name: 'New User',
          phone: '0987654321',
          address: 'Test Address'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail on weak password', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          email: 'newuser@example.com',
          password: '123',
          confirmPassword: '123',
          name: 'New User',
          phone: '0987654321',
          address: 'Test Address'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail on missing required fields', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          email: 'newuser@example.com',
          password: 'Password@123456'
          // missing confirmPassword, name, phone, address
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      await createTestUser({
        email: 'testuser@example.com',
        password: 'TestPassword@1234567',
        name: 'Test User'
      });
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'testuser@example.com',
          password: 'TestPassword@1234567'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.email).toBe('testuser@example.com');
    });

    it('should fail with wrong password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'testuser@example.com',
          password: 'WrongPassword@1234567'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPassword@123456'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should fail if account is locked', async () => {
      const user = await User.findOne({ email: 'testuser@example.com' });
      user.isLocked = true;
      await user.save();

      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'testuser@example.com',
          password: 'TestPassword@1234567'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ACCOUNT_LOCKED');
    });

    it('should fail on missing email or password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'testuser@example.com'
          // missing password
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/tokens/refresh', () => {
    it('should refresh token successfully with valid refresh token', async () => {
      const { user, tokens } = await createAuthenticatedUser();

      const res = await request(app)
        .post('/api/tokens/refresh')
        .send({
          refreshToken: tokens.refreshToken
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.accessToken).not.toBe(tokens.accessToken);
    });

    it('should fail with invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/tokens/refresh')
        .send({
          refreshToken: 'invalid.token.format'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_TOKEN');
    });

    it('should fail with missing refresh token', async () => {
      const res = await request(app)
        .post('/api/tokens/refresh')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail if refresh token is blacklisted', async () => {
      const { user, tokens } = await createAuthenticatedUser();

      // Blacklist the refresh token
      await TokenBlacklist.create({
        token: tokens.refreshToken,
        type: 'refresh',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      const res = await request(app)
        .post('/api/tokens/refresh')
        .send({
          refreshToken: tokens.refreshToken
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('TOKEN_REVOKED');
    });
  });

  describe('POST /api/tokens/logout', () => {
    it('should logout successfully and blacklist tokens', async () => {
      const { user, tokens } = await createAuthenticatedUser();

      const res = await request(app)
        .post('/api/tokens/logout')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send({
          refreshToken: tokens.refreshToken
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify refresh token is blacklisted
      const blacklisted = await TokenBlacklist.findOne({
        token: tokens.refreshToken
      });
      expect(blacklisted).toBeTruthy();
    });

    it('should fail without access token', async () => {
      const { user, tokens } = await createAuthenticatedUser();

      const res = await request(app)
        .post('/api/tokens/logout')
        .send({
          refreshToken: tokens.refreshToken
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('MISSING_TOKEN');
    });

    it('should fail with invalid access token', async () => {
      const res = await request(app)
        .post('/api/tokens/logout')
        .set('Authorization', 'Bearer invalid.token.format')
        .send({
          refreshToken: 'some.refresh.token'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_TOKEN');
    });

    it('should fail without refresh token in body', async () => {
      const { user, tokens } = await createAuthenticatedUser();

      const res = await request(app)
        .post('/api/tokens/logout')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
