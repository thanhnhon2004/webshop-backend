const express = require('express');
const userController = require('../controllers/userController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { validate, userRegisterSchema, userLoginSchema } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimit');
const { requireObjectId } = require('../middleware/objectId');

const router = express.Router();

// Public routes - apply strict rate limit (5 attempts/15min)
router.post('/register', authLimiter, validate(userRegisterSchema), userController.register);
router.post('/login', authLimiter, validate(userLoginSchema), userController.login);

// Protected routes (self only)
router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, userController.updateProfile);

// Admin routes
router.get('/', verifyToken, requireAdmin, userController.listCustomers);
router.put('/:userId/lock', verifyToken, requireAdmin, requireObjectId('userId'), userController.lockAccount);

// Admin: tạo tài khoản mới
router.post('/admin/users', verifyToken, requireAdmin, validate(userRegisterSchema), userController.adminCreateUser);
// Admin: update tài khoản user
router.put('/admin/users/:userId', verifyToken, requireAdmin, requireObjectId('userId'), userController.adminUpdateUser);

module.exports = router;
