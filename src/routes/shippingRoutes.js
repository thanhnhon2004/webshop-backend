const express = require('express');
const router = express.Router();
const shippingFeeController = require('../controllers/shippingFeeController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { validate, shippingFeeSchema } = require('../middleware/validate');

// Admin routes
router.post('/admin/shipping-fees', verifyToken, requireAdmin, 
  validate(shippingFeeSchema), 
  shippingFeeController.createShippingFee
);

router.get('/admin/shipping-fees', verifyToken, requireAdmin, shippingFeeController.getAllShippingFees);

router.get('/admin/shipping-fees/:shippingFeeId', verifyToken, requireAdmin, shippingFeeController.getShippingFeeDetail);

router.patch('/admin/shipping-fees/:shippingFeeId', verifyToken, requireAdmin, shippingFeeController.updateShippingFee);

router.delete('/admin/shipping-fees/:shippingFeeId', verifyToken, requireAdmin, shippingFeeController.deleteShippingFee);

// User routes - Public
router.post('/calculate-shipping', shippingFeeController.calculateShippingFee);

router.get('/provinces', shippingFeeController.getProvinces);

router.get('/provinces/:province/districts', shippingFeeController.getDistrictsByProvince);

module.exports = router;
