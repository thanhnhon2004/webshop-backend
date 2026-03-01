const Voucher = require('../models/Voucher');
const { successResponse, createdResponse } = require('../utils/response');
const { NotFoundError, AppError, ValidationError } = require('../middleware/errorHandler');

// Admin: Tạo voucher
const createVoucher = async (req, res, next) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minOrderAmount,
      maxUses,
      maxUsesPerUser,
      expiryDate,
      applicableCategories,
      applicableProducts
    } = req.body;

    // Validate input
    if (!code || !discountType || discountValue === undefined || !expiryDate) {
      throw new ValidationError('Missing required fields: code, discountType, discountValue, expiryDate');
    }

    if (!['percentage', 'fixed'].includes(discountType)) {
      throw new ValidationError('discountType must be "percentage" or "fixed"');
    }

    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      throw new ValidationError('Percentage discount must be between 0 and 100');
    }

    if (discountType === 'fixed' && discountValue <= 0) {
      throw new ValidationError('Fixed discount must be greater than 0');
    }

    const expiryTime = new Date(expiryDate);
    if (expiryTime < new Date()) {
      throw new ValidationError('Expiry date must be in the future');
    }

    // Kiểm tra code đã tồn tại
    const existingVoucher = await Voucher.findOne({ code: code.toUpperCase() });
    if (existingVoucher) {
      throw new AppError('Voucher code already exists', 409, 'VOUCHER_CODE_EXISTS');
    }

    const voucher = await Voucher.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      maxDiscount: maxDiscount || null,
      minOrderAmount: minOrderAmount || 0,
      maxUses: maxUses || null,
      maxUsesPerUser: maxUsesPerUser || 1,
      expiryDate: expiryTime,
      applicableCategories: applicableCategories || null,
      applicableProducts: applicableProducts || null
    });

    createdResponse(res, voucher, 'Voucher created successfully');
  } catch (err) {
    next(err);
  }
};

// Lấy danh sách voucher (admin)
const getAllVouchers = async (req, res, next) => {
  try {
    const { isActive, search } = req.query;
    let filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const vouchers = await Voucher.find(filter).populate('applicableProducts', 'name');
    successResponse(res, vouchers, 'Vouchers retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// Lấy chi tiết voucher
const getVoucherDetail = async (req, res, next) => {
  try {
    const { voucherId } = req.params;
    const voucher = await Voucher.findById(voucherId).populate('applicableProducts', 'name category');
    if (!voucher) throw new NotFoundError('Voucher not found');

    successResponse(res, voucher, 'Voucher retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// Cập nhật voucher
const updateVoucher = async (req, res, next) => {
  try {
    const { voucherId } = req.params;
    const { discountValue, maxUses, expiryDate, isActive, description } = req.body;

    const updateData = {};
    if (description !== undefined) updateData.description = description;
    if (discountValue !== undefined) updateData.discountValue = discountValue;
    if (maxUses !== undefined) updateData.maxUses = maxUses;
    if (expiryDate) {
      const expiryTime = new Date(expiryDate);
      if (expiryTime < new Date()) {
        throw new ValidationError('Expiry date must be in the future');
      }
      updateData.expiryDate = expiryTime;
    }
    if (isActive !== undefined) updateData.isActive = isActive;

    const voucher = await Voucher.findByIdAndUpdate(voucherId, updateData, { new: true });
    if (!voucher) throw new NotFoundError('Voucher not found');

    successResponse(res, voucher, 'Voucher updated successfully');
  } catch (err) {
    next(err);
  }
};

// Xóa voucher
const deleteVoucher = async (req, res, next) => {
  try {
    const { voucherId } = req.params;
    const voucher = await Voucher.findByIdAndDelete(voucherId);
    if (!voucher) throw new NotFoundError('Voucher not found');

    successResponse(res, null, 'Voucher deleted successfully');
  } catch (err) {
    next(err);
  }
};

// Kiểm tra & validate voucher (user dùng)
const validateVoucher = async (req, res, next) => {
  try {
    const { code, orderAmount, userId, productIds, categories } = req.body;

    if (!code || !orderAmount) {
      throw new ValidationError('Missing required fields: code, orderAmount');
    }

    const voucher = await Voucher.findOne({ code: code.toUpperCase() });
    if (!voucher) {
      throw new AppError('Voucher not found', 404, 'VOUCHER_NOT_FOUND');
    }

    // Kiểm tra voucher có active không
    if (!voucher.isActive) {
      throw new AppError('Voucher is not active', 400, 'VOUCHER_INACTIVE');
    }

    // Kiểm tra hạn sử dụng
    const now = new Date();
    if (now > voucher.expiryDate) {
      throw new AppError('Voucher has expired', 400, 'VOUCHER_EXPIRED');
    }

    if (voucher.startDate && now < voucher.startDate) {
      throw new AppError('Voucher is not yet available', 400, 'VOUCHER_NOT_STARTED');
    }

    // Kiểm tra số lần dùng
    if (voucher.maxUses && voucher.currentUses >= voucher.maxUses) {
      throw new AppError('Voucher has reached maximum uses', 400, 'VOUCHER_MAX_USES_REACHED');
    }

    // Kiểm tra tối thiểu đơn hàng
    if (orderAmount < voucher.minOrderAmount) {
      throw new AppError(
        `Minimum order amount is ₫${voucher.minOrderAmount}`,
        400,
        'VOUCHER_MIN_ORDER_NOT_MET'
      );
    }

    // Kiểm tra danh mục áp dụng
    if (voucher.applicableCategories && categories) {
      const hasApplicable = categories.some(cat => voucher.applicableCategories.includes(cat));
      if (!hasApplicable) {
        throw new AppError(
          'Voucher is not applicable to products in your cart',
          400,
          'VOUCHER_CATEGORY_NOT_APPLICABLE'
        );
      }
    }

    // Kiểm tra sản phẩm áp dụng
    if (voucher.applicableProducts && productIds) {
      const hasApplicable = productIds.some(pId =>
        voucher.applicableProducts.some(aId => aId.toString() === pId)
      );
      if (!hasApplicable) {
        throw new AppError(
          'Voucher is not applicable to products in your cart',
          400,
          'VOUCHER_PRODUCT_NOT_APPLICABLE'
        );
      }
    }

    // Tính số tiền giảm
    let discountAmount = 0;
    if (voucher.discountType === 'percentage') {
      discountAmount = Math.round((orderAmount * voucher.discountValue) / 100);
      if (voucher.maxDiscount) {
        discountAmount = Math.min(discountAmount, voucher.maxDiscount);
      }
    } else {
      discountAmount = voucher.discountValue;
    }

    // Đảm bảo discount không vượt quá order amount
    discountAmount = Math.min(discountAmount, orderAmount);

    successResponse(res, {
      voucherId: voucher._id,
      code: voucher.code,
      discountAmount,
      finalAmount: orderAmount - discountAmount,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue
    }, 'Voucher is valid');
  } catch (err) {
    next(err);
  }
};

// Kiểm tra voucher khả dụng (user xem danh sách)
const getAvailableVouchers = async (req, res, next) => {
  try {
    const now = new Date();
    const vouchers = await Voucher.find({
      isActive: true,
      expiryDate: { $gt: now },
      startDate: { $lte: now }
    }).select('code description discountType discountValue minOrderAmount applicableCategories');

    successResponse(res, vouchers, 'Available vouchers retrieved successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createVoucher,
  getAllVouchers,
  getVoucherDetail,
  updateVoucher,
  deleteVoucher,
  validateVoucher,
  getAvailableVouchers
};
