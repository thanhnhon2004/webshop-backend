# Testing Documentation

## Overview
This project includes comprehensive unit and integration tests for critical business paths using Jest and Supertest.

## Test Coverage

### 1. Authentication Tests (`tests/auth.test.js`)
Tests for user registration, login, token refresh, and logout mechanisms.

**Test Cases:**
- ✅ Register new user successfully
- ✅ Register with duplicate email (409)
- ✅ Register with password mismatch (400)
- ✅ Register with weak password (400)
- ✅ Login with correct credentials
- ✅ Login with wrong password (401)
- ✅ Login with non-existent email (401)
- ✅ Login with locked account (403)
- ✅ Refresh token successfully
- ✅ Refresh with invalid token (401)
- ✅ Logout and blacklist tokens
- ✅ Access blacklisted tokens (401)

**Coverage: 12 test scenarios**

### 2. Shopping Cart Tests (`tests/cart.test.js`)
Tests for cart operations: add items, update quantity, remove items, clear cart.

**Test Cases:**
- ✅ Get empty cart for new user
- ✅ Get cart with existing items
- ✅ Add item to cart successfully
- ✅ Increase quantity for existing item
- ✅ Add with non-existent product (404)
- ✅ Add exceeding stock (400)
- ✅ Update item quantity successfully
- ✅ Update exceeding stock (400)
- ✅ Update to invalid quantity (400)
- ✅ Remove item from cart
- ✅ Remove non-existent item (404)
- ✅ Clear entire cart

**Coverage: 12 test scenarios**

### 3. Checkout Tests (`tests/checkout.test.js`)
Tests for order creation, stock management, and payment processing.

**Test Cases:**
- ✅ Create order with valid cart
- ✅ Decrement stock after checkout
- ✅ Checkout with empty cart (400)
- ✅ Checkout with insufficient stock (400)
- ✅ Support multiple payment methods
- ✅ Generate unique order codes
- ✅ Get user orders
- ✅ Get order details
- ✅ Prevent access to other user orders (403)
- ✅ Clear cart after checkout

**Coverage: 10 test scenarios**

### 4. Admin Orders Tests (`tests/admin-orders.test.js`)
Tests for admin order management, status updates, and payment management.

**Test Cases:**
- ✅ Get all orders (admin only)
- ✅ Filter orders by status
- ✅ Filter orders by payment status
- ✅ Update order status
- ✅ Support all order statuses
- ✅ Rollback stock on cancellation
- ✅ Update payment status
- ✅ Support all payment statuses
- ✅ Track order status flow
- ✅ Prevent non-admin access (403)

**Coverage: 15+ test scenarios**

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
# Authentication tests only
npm run test:auth

# Cart tests only
npm run test:cart

# Checkout tests only
npm run test:checkout

# Admin orders tests only
npm run test:admin
```

### Watch Mode (Auto-run on file changes)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Structure

### Setup and Helpers
- **tests/setup.js** - Database connection, cleanup utilities
- **tests/helpers.js** - Test data factories for users, products, orders

### Test Files
- **tests/auth.test.js** - Authentication flows
- **tests/cart.test.js** - Shopping cart operations
- **tests/checkout.test.js** - Order creation and validation
- **tests/admin-orders.test.js** - Admin management features

## Key Test Features

### 1. Database Management
- Uses real MongoDB connection (development database)
- Clears database between tests to prevent data pollution
- Automatic cleanup in afterAll hook

### 2. Authentication Testing
- JWT token generation and verification
- Token blacklist validation
- Role-based access control (admin vs customer)

### 3. Stock Management
- Validates stock availability before purchase
- Decrements stock on order creation
- Restores stock on order cancellation

### 4. Error Handling
- Tests all HTTP error codes (400, 401, 403, 404, 409, 500)
- Validates error response format and error codes
- Ensures proper error messages

### 5. Data Integrity
- Verifies calculations (totals, quantities)
- Tests concurrent operations
- Validates state changes

## Test Data Factories

### createTestUser()
Creates a test user with optional field overrides.
```javascript
const user = await createTestUser({
  email: 'custom@example.com',
  password: 'CustomPassword@123456'
});
```

### createTestProduct()
Creates a test product for shopping tests.
```javascript
const product = await createTestProduct({
  championName: 'Ahri',
  price: 299000,
  stock: 50
});
```

### createAuthenticatedUser()
Creates a user with valid JWT tokens.
```javascript
const { user, tokens } = await createAuthenticatedUser();
// Use tokens.accessToken for API requests
```

### createTestCart()
Initializes a shopping cart with items.
```javascript
await createTestCart(userId, cartItems);
```

## Jest Configuration

Located in `jest.config.js`:

```javascript
{
  testEnvironment: 'node',
  testTimeout: 30000,
  forceExit: true,
  collectCoverageFrom: ['src/**/*.js'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  }
}
```

## Expected Test Output

```
PASS  tests/auth.test.js (5.234s)
  Authentication Tests
    POST /api/users/register
      ✓ should register a new user successfully (45ms)
      ✓ should fail on duplicate email (38ms)
    POST /api/users/login
      ✓ should login successfully (32ms)
      ✓ should fail with wrong password (28ms)

PASS  tests/cart.test.js (4.891s)
  Shopping Cart Tests
    GET /api/cart
      ✓ should return empty cart for new user (25ms)
    POST /api/cart/items
      ✓ should add item to cart (35ms)

...

Test Suites: 4 passed, 4 total
Tests: 47 passed, 47 total
Coverage: 65% branches, 72% functions, 68% lines
```

## Best Practices

### 1. Test Isolation
- Each test is independent
- Database is cleared before each test
- No shared state between tests

### 2. Error Scenarios
- Tests both success and failure paths
- Validates error codes and messages
- Tests edge cases (empty, invalid, missing fields)

### 3. Authentication
- All protected routes tested with and without tokens
- Token expiry and blacklist tested
- Role-based access control verified

### 4. Data Validation
- Input validation tested
- Business logic constraints verified
- State consistency checked

## Troubleshooting

### Tests Timeout
If tests take too long, increase timeout:
```javascript
jest.setTimeout(60000); // 60 seconds
```

### Database Connection Issues
Ensure MongoDB is running:
```bash
# Check if MongoDB is running
# Windows: services.msc -> MongoDB
# Linux: systemctl status mongod
```

### Token Generation Issues
Verify environment variables in `.env`:
```
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

## Continuous Integration

Add to your CI/CD pipeline:
```yaml
test:
  script:
    - npm install
    - npm test
  coverage: '/Coverage: \d+\.\d+/'
```

## Future Improvements

- [ ] Add E2E tests with real browser
- [ ] Add performance benchmarks
- [ ] Add load testing
- [ ] Add integration with CI/CD (GitHub Actions, GitLab CI)
- [ ] Add mutation testing
- [ ] Add visual regression testing
