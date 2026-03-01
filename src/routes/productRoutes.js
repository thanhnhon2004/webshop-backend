const express = require('express');
const productController = require('../controllers/productController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { validate, productCreateSchema, productUpdateSchema, productStockSchema } = require('../middleware/validate');
const { requireObjectId } = require('../middleware/objectId');
const { readLimiter } = require('../middleware/rateLimit');
const router = express.Router();

router.get('/', readLimiter, productController.getAll);
router.get('/:productId', readLimiter, requireObjectId('productId'), productController.getDetail);
router.post('/', verifyToken, requireAdmin, validate(productCreateSchema), productController.create);
router.put('/:productId', verifyToken, requireAdmin, requireObjectId('productId'), validate(productUpdateSchema), productController.update);
router.delete('/:productId', verifyToken, requireAdmin, requireObjectId('productId'), productController.remove);
router.patch('/:productId/stock', verifyToken, requireAdmin, requireObjectId('productId'), validate(productStockSchema), productController.updateStock);

module.exports = router;
