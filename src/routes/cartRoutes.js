const express = require('express');
const cartController = require('../controllers/cartController');
const { verifyToken, requireSelfOrAdmin } = require('../middleware/auth');
const { validate, cartAddSchema, cartUpdateSchema } = require('../middleware/validate');
const { requireObjectId } = require('../middleware/objectId');
const router = express.Router();

router.get('/:userId', verifyToken, requireObjectId('userId'), requireSelfOrAdmin('userId'), cartController.getCart);
router.post('/:userId/add', verifyToken, requireObjectId('userId'), requireSelfOrAdmin('userId'), validate(cartAddSchema), cartController.addItem);
router.put('/:userId/item/:productId', verifyToken, requireObjectId('userId'), requireObjectId('productId'), requireSelfOrAdmin('userId'), validate(cartUpdateSchema), cartController.updateItem);
router.delete('/:userId/item/:productId', verifyToken, requireObjectId('userId'), requireObjectId('productId'), requireSelfOrAdmin('userId'), cartController.removeItem);
router.delete('/:userId', verifyToken, requireObjectId('userId'), requireSelfOrAdmin('userId'), cartController.clearCart);

module.exports = router;
