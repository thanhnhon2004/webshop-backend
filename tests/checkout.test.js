/**
 * Checkout & Order Tests
 * Tests for checkout process, order creation, validation
 */

const request = require('supertest');
const express = require('express');
const { connectDB, disconnectDB, clearDatabase } = require('./setup');
const {
  createAuthenticatedUser,
  createTestProduct,
  createTestCart
} = require('./helpers');
const orderRoutes = require('../src/routes/orderRoutes');
const Order = require('../src/models/Order');
const Product = require('../src/models/Product');
const Cart = require('../src/models/Cart');
const helmet = require('helmet');
const cors = require('cors');
const { errorHandler } = require('../src/middleware/errorHandler');

// Setup test app
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/api/orders', orderRoutes);
app.use(errorHandler);

describe('Checkout & Order Tests', () => {
  let authUser;
  let product1, product2;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearDatabase();
    authUser = await createAuthenticatedUser();

    product1 = await createTestProduct({
      champion: 'Ahri',
      name: 'Ahri Figurine',
      price: 299000,
      stock: 50
    });

    product2 = await createTestProduct({
      champion: 'Lux',
      name: 'Lux Figurine',
      price: 399000,
      stock: 30
    });
  });

  describe('POST /api/orders/checkout', () => {
    it('should create order successfully with valid cart', async () => {
      const cartItems = [
        {
          productId: product1._id.toString(),
          quantity: 2,
          price: product1.price
        },
        {
          productId: product2._id.toString(),
          quantity: 1,
          price: product2.price
        }
      ];

      await createTestCart(authUser.user._id.toString(), cartItems);

      const res = await request(app)
        .post(`/api/orders/${authUser.user._id}/checkout`)
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`)
        .send({
          shippingAddress: '123 Test Street, City, Country',
          paymentMethod: 'credit_card'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order).toHaveProperty('_id');
      expect(res.body.data.order).toHaveProperty('orderCode');
      expect(res.body.data.order.orderStatus).toBe('pending');
      expect(res.body.data.order.paymentStatus).toBe('pending');
      expect(res.body.data.order.totalPrice).toBe(2 * product1.price + product2.price);

      // Verify cart is cleared
      const cart = await Cart.findOne({ userId: authUser.user._id });
      expect(cart.items).toEqual([]);
    });

    it('should decrement stock for all products in order', async () => {
      const cartItems = [
        {
          productId: product1._id.toString(),
          quantity: 5,
          price: product1.price
        }
      ];

      await createTestCart(authUser.user._id.toString(), cartItems);

      const originalStock = product1.stock;

      const res = await request(app)
        .post(`/api/orders/${authUser.user._id}/checkout`)
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`)
        .send({
          shippingAddress: '123 Test Street, City, Country',
          paymentMethod: 'credit_card'
        });

      expect(res.status).toBe(201);
        // Verify stock is decremented
      const updatedProduct = await Product.findById(product1._id);
      expect(updatedProduct.stock).toBe(originalStock - 5);
    });

    it('should fail if cart is empty', async () => {
      const res = await request(app)
        .post(`/api/orders/${authUser.user._id}/checkout`)
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`)
        .send({
          shippingAddress: '123 Test Street, City, Country',
          paymentMethod: 'credit_card'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMPTY_CART');
    });

    it('should fail if product is out of stock', async () => {
      // Update product stock to 1
      product1.stock = 1;
      await product1.save();

      const cartItems = [
        {
          productId: product1._id.toString(),
          quantity: 5, // Try to order 5 when only 1 in stock
          price: product1.price
        }
      ];

      await createTestCart(authUser.user._id.toString(), cartItems);

      const res = await request(app)
        .post(`/api/orders/${authUser.user._id}/checkout`)
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`)
        .send({
          shippingAddress: '123 Test Street, City, Country',
          paymentMethod: 'credit_card'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INSUFFICIENT_STOCK');
    });

    it('should support multiple payment methods', async () => {
      const cartItems = [
        {
          productId: product1._id.toString(),
          quantity: 1,
          price: product1.price
        }
      ];

      await createTestCart(authUser.user._id.toString(), cartItems);

      const paymentMethods = ['credit_card', 'bank_transfer', 'cash_on_delivery'];

      for (const method of paymentMethods) {
        await clearDatabase();
        authUser = await createAuthenticatedUser();

        product1 = await createTestProduct({
          champion: 'Ahri',
          name: 'Ahri Figurine',
          price: 299000,
          stock: 50
        });

        await createTestCart(authUser.user._id.toString(), cartItems);

        const res = await request(app)
        .post(`/api/orders/${authUser.user._id}/checkout`)
          .send({
            shippingAddress: '123 Test Street, City, Country',
            paymentMethod: method
          });

        expect(res.status).toBe(201);
        expect(res.body.data.order.paymentMethod).toBe(method);
      }
    });

    it('should fail with missing shipping address', async () => {
      const cartItems = [
        {
          productId: product1._id.toString(),
          quantity: 1,
          price: product1.price
        }
      ];

      await createTestCart(authUser.user._id.toString(), cartItems);

      const res = await request(app)
        .post(`/api/orders/${authUser.user._id}/checkout`)
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`)
        .send({
          paymentMethod: 'credit_card'
          // missing shippingAddress
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should generate unique order code', async () => {
      const cartItems = [
        {
          productId: product1._id.toString(),
          quantity: 1,
          price: product1.price
        }
      ];

      await createTestCart(authUser.user._id.toString(), cartItems);

      const res1 = await request(app)
        .post(`/api/orders/${authUser.user._id}/checkout`)
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`)
        .send({
          shippingAddress: '123 Test Street, City, Country',
          paymentMethod: 'credit_card'
        });

      const orderCode1 = res1.body.data.order.orderCode;

      // Create another user and order
      const authUser2 = await createAuthenticatedUser();
      await createTestCart(authUser2.user._id.toString(), cartItems);

      const res2 = await request(app)
        .post(`/api/orders/${authUser2.user._id}/checkout`)
        .set('Authorization', `Bearer ${authUser2.tokens.accessToken}`)
        .send({
          shippingAddress: '456 Another Street, City, Country',
          paymentMethod: 'credit_card'
        });

      const orderCode2 = res2.body.data.order.orderCode;

      expect(orderCode1).not.toBe(orderCode2);
    });
  });

  describe('GET /api/orders', () => {
    it('should return user orders', async () => {
      const cartItems = [
        {
          productId: product1._id.toString(),
          quantity: 1,
          price: product1.price
        }
      ];

      await createTestCart(authUser.user._id.toString(), cartItems);

      // Create an order
      await request(app)
        .post(`/api/orders/${authUser.user._id}/checkout`)
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`)
        .send({
          shippingAddress: '123 Test Street, City, Country',
          paymentMethod: 'credit_card'
        });

      // Fetch orders
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orders.length).toBeGreaterThan(0);
      expect(res.body.data.orders[0].userId).toBe(authUser.user._id.toString());
    });

    it('should return empty array if user has no orders', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orders).toEqual([]);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .get('/api/orders');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/orders/:orderId', () => {
    it('should return order detail for user order', async () => {
      const cartItems = [
        {
          productId: product1._id.toString(),
          quantity: 2,
          price: product1.price
        }
      ];

      await createTestCart(authUser.user._id.toString(), cartItems);

      const checkoutRes = await request(app)
        .post(`/api/orders/${authUser.user._id}/checkout`)
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`)
        .send({
          shippingAddress: '123 Test Street, City, Country',
          paymentMethod: 'credit_card'
        });

      const orderId = checkoutRes.body.data.order._id;

      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order._id).toBe(orderId);
      expect(res.body.data.order.items.length).toBe(1);
      expect(res.body.data.order.items[0].quantity).toBe(2);
    });

    it('should fail if user accesses other user order', async () => {
      const authUser2 = await createAuthenticatedUser();

      const cartItems = [
        {
          productId: product1._id.toString(),
          quantity: 1,
          price: product1.price
        }
      ];

      await createTestCart(authUser2.user._id.toString(), cartItems);

      const checkoutRes = await request(app)
        .post(`/api/orders/${authUser2.user._id}/checkout`)
        .set('Authorization', `Bearer ${authUser2.tokens.accessToken}`)
        .send({
          shippingAddress: '123 Test Street, City, Country',
          paymentMethod: 'credit_card'
        });

      const orderId = checkoutRes.body.data.order._id;

      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should fail with invalid order ID', async () => {
      const res = await request(app)
        .get('/api/orders/invalid-id')
        .set('Authorization', `Bearer ${authUser.tokens.accessToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
