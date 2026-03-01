/**
 * Test Helpers & Utilities
 * Factories for creating test data
 */

const bcryptjs = require('bcryptjs');
const tokenUtils = require('../src/utils/tokenUtils');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Cart = require('../src/models/Cart');
const Order = require('../src/models/Order');

/**
 * Create test user
 */
async function createTestUser(overrides = {}) {
  const defaults = {
    email: `test${Date.now()}@example.com`,
    password: 'Test@1234567',
    name: 'Test User',
    phone: '0123456789',
    address: '123 Test Street',
    role: 'user',
    isVerified: true,
    isLocked: false
  };

  const userData = { ...defaults, ...overrides };
  const passwordHash = await bcryptjs.hash(userData.password, 10);

  const user = new User({
    email: userData.email,
    passwordHash,
    name: userData.name,
    phone: userData.phone,
    address: userData.address,
    role: userData.role,
    isVerified: userData.isVerified,
    isLocked: userData.isLocked
  });

  await user.save();
  return user;
}

/**
 * Create test admin
 */
async function createTestAdmin(overrides = {}) {
  return createTestUser({
    ...overrides,
    role: 'admin',
    email: `admin${Date.now()}@example.com`
  });
}

/**
 * Create test product
 */
async function createTestProduct(overrides = {}) {
  const defaults = {
    name: 'Ahri Figurine - Classic Skin',
    champion: 'Ahri',
    description: 'High-quality figurine of Ahri',
    category: 'Figrue',
    price: 299000,
    stock: 50,
    image: 'http://localhost:2004/uploads/products/test-product.jpg',
    rating: 4.5,
    reviews: 10
  };

  const productData = { ...defaults, ...overrides };
  const product = new Product(productData);
  await product.save();
  return product;
}

/**
 * Create test cart for user
 */
async function createTestCart(userId, items = []) {
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({
      userId,
      items: items,
      totalItems: items.length,
      totalPrice: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    });
  } else {
    cart.items = items;
    cart.totalItems = items.length;
    cart.totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  await cart.save();
  return cart;
}

/**
 * Create test order
 */
async function createTestOrder(overrides = {}) {
  const defaults = {
    userId: null,
    items: [],
    totalPrice: 0,
    shippingAddress: '123 Test Street, City, Country',
    paymentMethod: 'credit_card',
    paymentStatus: 'pending',
    orderStatus: 'pending',
    notes: 'Test order'
  };

  const orderData = { ...defaults, ...overrides };
  const order = new Order(orderData);
  await order.save();
  return order;
}

/**
 * Generate test tokens
 */
async function generateTestTokens(userId, role = 'user') {
  const tokens = await tokenUtils.generateTokenPair({
    userId,
    email: `test${userId}@example.com`,
    role
  });
  return tokens;
}

/**
 * Create authenticated user with tokens
 */
async function createAuthenticatedUser(overrides = {}) {
  const user = await createTestUser(overrides);
  const tokens = await generateTestTokens(user._id.toString(), user.role);
  return { user, tokens };
}

module.exports = {
  createTestUser,
  createTestAdmin,
  createTestProduct,
  createTestCart,
  createTestOrder,
  generateTestTokens,
  createAuthenticatedUser
};
