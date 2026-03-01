const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { validate, voucherSchema, voucherValidateSchema } = require('../middleware/validate');

// Admin routes
router.post('/admin/vouchers', verifyToken, requireAdmin, 
  validate(voucherSchema), 
  voucherController.createVoucher
);

router.get('/admin/vouchers', verifyToken, requireAdmin, voucherController.getAllVouchers);

router.get('/admin/vouchers/:voucherId', verifyToken, requireAdmin, voucherController.getVoucherDetail);

router.patch('/admin/vouchers/:voucherId', verifyToken, requireAdmin, voucherController.updateVoucher);

router.delete('/admin/vouchers/:voucherId', verifyToken, requireAdmin, voucherController.deleteVoucher);

// User routes
router.get('/available-vouchers', voucherController.getAvailableVouchers);

router.post('/validate-voucher', 
  validate(voucherValidateSchema), 
  voucherController.validateVoucher
);

module.exports = router;
