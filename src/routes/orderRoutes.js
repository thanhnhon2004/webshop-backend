const express = require('express');
const orderController = require('../controllers/orderController');
const { verifyToken, requireAdmin, requireSelfOrAdmin } = require('../middleware/auth');
const { validate, checkoutSchema } = require('../middleware/validate');
const { requireObjectId } = require('../middleware/objectId');
const router = express.Router();

// ===== ORDER ROUTES =====
router.get('/admin/all-orders', verifyToken, requireAdmin, orderController.adminGetAllOrders);
router.put('/:orderId/status', verifyToken, requireAdmin, requireObjectId('orderId'), orderController.updateStatus);
router.put('/:orderId/payment', verifyToken, requireAdmin, requireObjectId('orderId'), orderController.updatePayment);

router.post('/:userId/checkout', verifyToken, requireObjectId('userId'), requireSelfOrAdmin('userId'), validate(checkoutSchema), orderController.checkout);
router.get('/:userId/:orderId', verifyToken, requireObjectId('userId'), requireObjectId('orderId'), requireSelfOrAdmin('userId'), orderController.getOrderDetail);
router.get('/:userId', verifyToken, requireObjectId('userId'), requireSelfOrAdmin('userId'), orderController.getUserOrders);

// VNPay integration removed

module.exports = router;
