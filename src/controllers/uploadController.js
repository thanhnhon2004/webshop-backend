const path = require('path');
const fs = require('fs');
const config = require('../config/environment');
const { successResponse } = require('../utils/response');
const { AppError } = require('../middleware/errorHandler');

/**
 * Tạo URL chuẩn cho ảnh
 * VD: ahri-1704537600000.jpg → http://localhost:2004/uploads/products/ahri-1704537600000.jpg
 */
const getImageUrl = (value) => {
  if (!value) return value;

  // If already an absolute URL, return as-is
  if (typeof value === 'string' && value.startsWith('http')) return value;

  // If value looks like a path (/uploads/products/...), extract basename
  // or if it's already a filename, use it directly
  const filename = path.basename(String(value));

  return `${config.upload.baseUrl}/uploads/products/${filename}`;
};

/**
 * Upload một ảnh sản phẩm
 * POST /api/upload/product-image
 */
const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/products/${req.file.filename}`;

    res.status(201).json({
      message: "Upload successful",
      image: imageUrl
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload nhiều ảnh sản phẩm
 * POST /api/upload/product-images
 */
const uploadProductImages = (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new AppError('No files uploaded', 400, 'NO_FILES');
    }

    const images = req.files.map(file => ({
      filename: file.filename,
      url: getImageUrl(file.filename),
      size: file.size
    }));

    successResponse(res, {
      count: images.length,
      images
    }, `${images.length} image(s) uploaded successfully`, 201);
  } catch (err) {
    // Xóa files nếu có lỗi
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting file:', unlinkErr);
        });
      });
    }
    next(err);
  }
};

/**
 * Xóa ảnh sản phẩm
 * DELETE /api/upload/product-image/:filename
 */
const deleteProductImage = (req, res, next) => {
  try {
    const { filename } = req.params;

    // Validate filename (chỉ cho phép alphanumeric, dấu gạch)
    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
      throw new AppError('Invalid filename', 400, 'INVALID_FILENAME');
    }

    const filepath = path.join(__dirname, '../uploads/products', filename);

    // Kiểm tra file có tồn tại
    if (!fs.existsSync(filepath)) {
      throw new AppError('Image not found', 404, 'IMAGE_NOT_FOUND');
    }

    // Xóa file
    fs.unlinkSync(filepath);

    successResponse(res, null, 'Image deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadProductImage,
  uploadProductImages,
  deleteProductImage,
  getImageUrl
};
