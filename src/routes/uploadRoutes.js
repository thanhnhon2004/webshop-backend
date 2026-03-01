const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

/**
 * Upload một ảnh sản phẩm
 * POST /api/upload/product-image
 * Headers: Authorization: Bearer <token>
 * FormData: file
 */
// Log để debug token và quyền admin khi upload ảnh
router.post(
  '/product-image',
  (req, res, next) => {
    console.log("STEP 1");
    next();
  },
  verifyToken,
  (req, res, next) => {
    console.log("STEP 2 - after verify");
    next();
  },
  upload.single('file'),
  (req, res, next) => {
    console.log("STEP 3 - after multer");
    console.log(req.file);
    next();
  },
  uploadController.uploadProductImage
);

/**
 * Upload nhiều ảnh sản phẩm
 * POST /api/upload/product-images
 * Headers: Authorization: Bearer <token>
 * FormData: files[] (multiple)
 */
router.post(
  '/product-images',
  verifyToken,
  requireAdmin,
  upload.array('files', 10), // Max 10 ảnh
  uploadController.uploadProductImages
);

/**
 * Xóa ảnh sản phẩm
 * DELETE /api/upload/product-image/:filename
 */
router.delete(
  '/product-image/:filename',
  verifyToken,
  requireAdmin,
  uploadController.deleteProductImage
);

module.exports = router;
