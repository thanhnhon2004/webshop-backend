/**
 * Shopping Cart Tests
 * Tests for cart operations: add, update, remove, clear
 */

const request = require('supertest');
const express = require('express');
const { connectDB, disconnectDB, clearDatabase } = require('./setup');
const {
  createAuthenticatedUser,
  createTestProduct,
  createTestCart
} = require('./helpers');
const cartRoutes = require('../src/routes/cartRoutes');
const Cart = require('../src/models/Cart');
const Product = require('../src/models/Product');
const helmet = require('helmet');
const cors = require('cors');
const { errorHandler } = require('../src/middleware/errorHandler');

// Setup test app
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/api/cart', cartRoutes);
app.use(errorHandler);

describe('Shopping Cart Tests', () => {
  let authUser;
  let testProduct;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearDatabase();
    authUser = await createAuthenticatedUser();
    testProduct = await createTestProduct({
      champion: 'Lux',
      name: 'Lux Figurine',
      price: 399000,
      stock: 100
    });
  });

  describe('GET /api/cart', () => {
    it('should return empty cart for new user', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toEqual([]);
      expect(res.body.data.totalItems).toBe(0);
      expect(res.body.data.totalPrice).toBe(0);
    });

    it('should return cart with items if items exist', async () => {
      const cartItem = {
        productId: testProduct._id.toString(),
        quantity: 2,
        price: testProduct.price
      };

      await createTestCart(authUser.user._id.toString(), [cartItem]);

      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.totalItems).toBe(2);
      expect(res.body.data.totalPrice).toBe(testProduct.price * 2);
    });

    it('should fail without authentication token', async () => {
      const res = await request(app)
        .get('/api/cart');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('MISSING_TOKEN');
    });

    it('should fail with invalid token', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', 'Bearer invalid.token.format');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_TOKEN');
    });
  });

  describe('POST /api/cart/items', () => {
    it('should add item to cart successfully', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`)
        .send({
          productId: testProduct._id.toString(),
          quantity: 2
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].productId).toBe(testProduct._id.toString());
      expect(res.body.data.items[0].quantity).toBe(2);
      expect(res.body.data.totalPrice).toBe(testProduct.price * 2);
    });

    it('should increase quantity if item already exists', async () => {
      const cartItem = {
        productId: testProduct._id.toString(),
        quantity: 1,
        price: testProduct.price
      };

      await createTestCart(authUser.user._id.toString(), [cartItem]);

      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`)
        .send({
          productId: testProduct._id.toString(),
          quantity: 2
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items[0].quantity).toBe(3);
      expect(res.body.data.totalPrice).toBe(testProduct.price * 3);
    });

    it('should fail if product does not exist', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`)
        .send({
          productId: '507f1f77bcf86cd799439999',
          quantity: 1
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('should fail if quantity exceeds stock', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`)
        .send({
          productId: testProduct._id.toString(),
          quantity: 101 // Stock is 100
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INSUFFICIENT_STOCK');
    });

    it('should fail on invalid product ID format', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`)
        .send({
          productId: 'invalid-id',
          quantity: 1
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with missing required fields', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`)
        .send({
          productId: testProduct._id.toString()
          // missing quantity
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/cart/items/:productId', () => {
    beforeEach(async () => {
      const cartItem = {
        productId: testProduct._id.toString(),
        quantity: 5,
        price: testProduct.price
      };
      await createTestCart(authUser.user._id.toString(), [cartItem]);
    });

    it('should update item quantity successfully', async () => {
      const res = await request(app)
        .put(`/api/cart/items/${testProduct._id.toString()}`)
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`)
        .send({
          quantity: 3
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items[0].quantity).toBe(3);
      expect(res.body.data.totalPrice).toBe(testProduct.price * 3);
    });

    it('should fail if new quantity exceeds stock', async () => {
      const res = await request(app)
        .put(`/api/cart/items/${testProduct._id.toString()}`)
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`)
        .send({
          quantity: 101 // Stock is 100
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INSUFFICIENT_STOCK');
    });

    it('should fail with quantity of 0', async () => {
      const res = await request(app)
        .put(`/api/cart/items/${testProduct._id.toString()}`)
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`)
        .send({
          quantity: 0
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail if item not in cart', async () => {
      const anotherProduct = await createTestProduct({
        champion: 'Teemo',
        name: 'Teemo Figurine'
      });

      const res = await request(app)
        .put(`/api/cart/items/${anotherProduct._id.toString()}`)
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`)
        .send({
          quantity: 1
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ITEM_NOT_IN_CART');
    });
  });

  describe('DELETE /api/cart/items/:productId', () => {
    beforeEach(async () => {
      const cartItems = [
        {
          productId: testProduct._id.toString(),
          quantity: 2,
          price: testProduct.price
        }
      ];
      await createTestCart(authUser.user._id.toString(), cartItems);
    });

    it('should remove item from cart successfully', async () => {
      const res = await request(app)
        .delete(`/api/cart/items/${testProduct._id.toString()}`)
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toEqual([]);
      expect(res.body.data.totalItems).toBe(0);
      expect(res.body.data.totalPrice).toBe(0);
    });

    it('should fail if item not in cart', async () => {
      const anotherProduct = await createTestProduct({
        champion: 'Yasuo',
        name: 'Yasuo Figurine'
      });

      const res = await request(app)
        .delete(`/api/cart/items/${anotherProduct._id.toString()}`)
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ITEM_NOT_IN_CART');
    });

    it('should fail on invalid product ID format', async () => {
      const res = await request(app)
        .delete('/api/cart/items/invalid-id')
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/cart', () => {
    it('should clear entire cart successfully', async () => {
      const cartItems = [
        {
          productId: testProduct._id.toString(),
          quantity: 2,
          price: testProduct.price
        }
      ];
      await createTestCart(authUser.user._id.toString(), cartItems);

      const res = await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toEqual([]);
      expect(res.body.data.totalItems).toBe(0);
      expect(res.body.data.totalPrice).toBe(0);
    });

    it('should work on empty cart', async () => {
      const res = await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toEqual([]);
    });
  });
});
