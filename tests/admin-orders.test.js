/**
 * Admin Orders Management Tests
 * Tests for admin order operations: list, filter, update status, update payment
 */

const request = require('supertest');
const express = require('express');
const { connectDB, disconnectDB, clearDatabase } = require('./setup');
const {
  createAuthenticatedUser,
  createTestProduct,
  createTestCart,
  createTestAdmin
} = require('./helpers');
const orderRoutes = require('../src/routes/orderRoutes');
const Order = require('../src/models/Order');
const Product = require('../src/models/Product');
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

describe('Admin Orders Management Tests', () => {
  let adminUser;
  let regularUser;
  let product1;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearDatabase();

    // Create admin user
    adminUser = await createTestAdmin();
    const { generateTestTokens } = require('../tests/helpers');
    const adminTokens = await generateTestTokens(adminUser._id.toString(), 'admin');
    adminUser.tokens = adminTokens;

    // Create regular user with order
    regularUser = await createAuthenticatedUser();

    product1 = await createTestProduct({
      champion: 'Ahri',
      name: 'Ahri Figurine',
      price: 299000,
      stock: 100
    });
  });

  describe('GET /api/orders/admin/all', () => {
    it('should return all orders for admin', async () => {
      // Create multiple orders
      for (let i = 0; i < 3; i++) {
        const user = await createAuthenticatedUser();
        const cartItems = [
          {
            productId: product1._id.toString(),
            quantity: 1,
            price: product1.price
          }
        ];
        await createTestCart(user.user._id.toString(), cartItems);

        await request(app)
          .post('/api/orders/checkout')
          .set('Authorization', `Bearer ${user.tokens.accessToken}`)
          .send({
            shippingAddress: '123 Test Street, City, Country',
            paymentMethod: 'credit_card'
          });
      }

      const res = await request(app)
        .get('/api/orders/admin/all')
        .set('Authorization', `Bearer ${adminUser.tokens.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orders.length).toBe(3);
    });

    it('should fail if user is not admin', async () => {
      const res = await request(app)
        .get('/api/orders/admin/all')
        .set('Authorization', `Bearer ${regularUser.tokens.accessToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .get('/api/orders/admin/all');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return empty array if no orders exist', async () => {
      const res = await request(app)
        .get('/api/orders/admin/all')
        .set('Authorization', `Bearer ${adminUser.tokens.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orders).toEqual([]);
    });
  });

  describe('Filtering Orders by Status', () => {
    beforeEach(async () => {
      // Create orders with different statuses
      const user1 = await createAuthenticatedUser();
      const cartItems = [
        {
          productId: product1._id.toString(),
          quantity: 1,
          price: product1.price
        }
      ];

      await createTestCart(user1.user._id.toString(), cartItems);
      const order1 = await request(app)
        .post('/api/orders/checkout')
        .set('Authorization', `Bearer ${user1.tokens.accessToken}`)
        .send({
          shippingAddress: '123 Test Street, City, Country',
          paymentMethod: 'credit_card'
        });

      // Create another order and set it to shipped
      const user2 = await createAuthenticatedUser();
      await createTestCart(user2.user._id.toString(), cartItems);
      const order2Res = await request(app)
        .post('/api/orders/checkout')
        .set('Authorization', `Bearer ${user2.tokens.accessToken}`)
        .send({
          shippingAddress: '456 Another Street, City, Country',
          paymentMethod: 'credit_card'
        });

      const order2Id = order2Res.body.data.order._id;
      const order2 = await Order.findById(order2Id);
      order2.orderStatus = 'shipped';
      await order2.save();
    });

    it('should filter orders by status', async () => {
      const res = await request(app)
        .get('/api/orders/admin/all?status=pending')
        .set('Authorization', `Bearer ${adminUser.tokens.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orders.length).toBeGreaterThan(0);
      res.body.data.orders.forEach(order => {
        expect(order.orderStatus).toBe('pending');
      });
    });

    it('should filter orders by payment status', async () => {
      const res = await request(app)
        .get('/api/orders/admin/all?paymentStatus=pending')
        .set('Authorization', `Bearer ${adminUser.tokens.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.orders.forEach(order => {
        expect(order.paymentStatus).toBe('pending');
      });
    });
  });

  describe('PUT /api/orders/:orderId/status', () => {
    let testOrder;

    beforeEach(async () => {
      const cartItems = [
        {
          productId: product1._id.toString(),
          quantity: 5,
          price: product1.price
        }
      ];

      await createTestCart(regularUser.user._id.toString(), cartItems);

      const checkoutRes = await request(app)
        .post('/api/orders/checkout')
        .set('Authorization', `Bearer ${regularUser.tokens.accessToken}`)
        .send({
          shippingAddress: '123 Test Street, City, Country',
          paymentMethod: 'credit_card'
        });

      testOrder = checkoutRes.body.data.order;
    });

    it('should update order status successfully', async () => {
      const res = await request(app)
        .put(`/api/orders/${testOrder._id}/status`)
        .set('Authorization', `Bearer ${adminUser.tokens.accessToken}`)
        .send({
          orderStatus: 'shipped'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order.orderStatus).toBe('shipped');
    });

    it('should support all order statuses', async () => {
      const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

      for (const status of statuses) {
        const res = await request(app)
          .put(`/api/orders/${testOrder._id}/status`)
          .set('Authorization', `Bearer ${adminUser.tokens.accessToken}`)
          .send({
            orderStatus: status
          });

        expect(res.status).toBe(200);
        expect(res.body.data.order.orderStatus).toBe(status);
      }
    });

    it('should rollback stock when cancelling order', async () => {
      const originalStock = product1.stock;

      const res = await request(app)
        .put(`/api/orders/${testOrder._id}/status`)
        .set('Authorization', `Bearer ${adminUser.tokens.accessToken}`)
        .send({
          orderStatus: 'cancelled'
        });

      expect(res.status).toBe(200);

      // Verify stock is restored
      const updatedProduct = await Product.findById(product1._id);
      expect(updatedProduct.stock).toBe(originalStock + 5);
    });

    it('should fail if non-admin tries to update status', async () => {
      const res = await request(app)
        .put(`/api/orders/${testOrder._id}/status`)
        .set('Authorization', `Bearer ${regularUser.tokens.accessToken}`)
        .send({
          orderStatus: 'shipped'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should fail with invalid order ID', async () => {
      const res = await request(app)
        .put('/api/orders/invalid-id/status')
        .set('Authorization', `Bearer ${adminUser.tokens.accessToken}`)
        .send({
          orderStatus: 'shipped'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with non-existent order', async () => {
      const res = await request(app)
        .put('/api/orders/507f1f77bcf86cd799439999/status')
        .set('Authorization', `Bearer ${adminUser.tokens.accessToken}`)
        .send({
          orderStatus: 'shipped'
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ORDER_NOT_FOUND');
    });
  });

  describe('PUT /api/orders/:orderId/payment', () => {
    let testOrder;

    beforeEach(async () => {
      const cartItems = [
        {
          productId: product1._id.toString(),
          quantity: 1,
          price: product1.price
        }
      ];

      await createTestCart(regularUser.user._id.toString(), cartItems);

      const checkoutRes = await request(app)
        .post('/api/orders/checkout')
        .set('Authorization', `Bearer ${regularUser.tokens.accessToken}`)
        .send({
          shippingAddress: '123 Test Street, City, Country',
          paymentMethod: 'credit_card'
        });

      testOrder = checkoutRes.body.data.order;
    });

    it('should update payment status successfully', async () => {
      const res = await request(app)
        .put(`/api/orders/${testOrder._id}/payment`)
        .set('Authorization', `Bearer ${adminUser.tokens.accessToken}`)
        .send({
          paymentStatus: 'completed'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order.paymentStatus).toBe('completed');
    });

    it('should support all payment statuses', async () => {
      const statuses = ['pending', 'completed', 'failed', 'refunded'];

      for (const status of statuses) {
        const res = await request(app)
          .put(`/api/orders/${testOrder._id}/payment`)
          .set('Authorization', `Bearer ${adminUser.tokens.accessToken}`)
          .send({
            paymentStatus: status
          });

        expect(res.status).toBe(200);
        expect(res.body.data.order.paymentStatus).toBe(status);
      }
    });

    it('should fail if non-admin tries to update payment', async () => {
      const res = await request(app)
        .put(`/api/orders/${testOrder._id}/payment`)
        .set('Authorization', `Bearer ${regularUser.tokens.accessToken}`)
        .send({
          paymentStatus: 'completed'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should fail with invalid order ID', async () => {
      const res = await request(app)
        .put('/api/orders/invalid-id/payment')
        .set('Authorization', `Bearer ${adminUser.tokens.accessToken}`)
        .send({
          paymentStatus: 'completed'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with non-existent order', async () => {
      const res = await request(app)
        .put('/api/orders/507f1f77bcf86cd799439999/payment')
        .set('Authorization', `Bearer ${adminUser.tokens.accessToken}`)
        .send({
          paymentStatus: 'completed'
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ORDER_NOT_FOUND');
    });
  });

  describe('Order Status Transitions', () => {
    it('should track order status flow: pending -> confirmed -> shipped -> delivered', async () => {
      const cartItems = [
        {
          productId: product1._id.toString(),
          quantity: 1,
          price: product1.price
        }
      ];

      await createTestCart(regularUser.user._id.toString(), cartItems);

      const checkoutRes = await request(app)
        .post('/api/orders/checkout')
        .set('Authorization', `Bearer ${regularUser.tokens.accessToken}`)
        .send({
          shippingAddress: '123 Test Street, City, Country',
          paymentMethod: 'credit_card'
        });

      let orderId = checkoutRes.body.data.order._id;

      // pending -> confirmed
      let res = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminUser.tokens.accessToken}`)
        .send({ orderStatus: 'confirmed' });
      expect(res.body.data.order.orderStatus).toBe('confirmed');

      // confirmed -> shipped
      res = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminUser.tokens.accessToken}`)
        .send({ orderStatus: 'shipped' });
      expect(res.body.data.order.orderStatus).toBe('shipped');

      // shipped -> delivered
      res = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminUser.tokens.accessToken}`)
        .send({ orderStatus: 'delivered' });
      expect(res.body.data.order.orderStatus).toBe('delivered');
    });
  });
});
