const ShippingFee = require('../models/ShippingFee');
const { successResponse, createdResponse } = require('../utils/response');
const { NotFoundError, AppError, ValidationError } = require('../middleware/errorHandler');

// Admin: Tạo phí vận chuyển
const createShippingFee = async (req, res, next) => {
  try {
    const { province, district, baseFee, perKgFee, estimatedDays, description } = req.body;

    if (!province || baseFee === undefined) {
      throw new ValidationError('Missing required fields: province, baseFee');
    }

    if (baseFee < 0) {
      throw new ValidationError('Base fee must be >= 0');
    }

    // Kiểm tra đã có cặp province-district này chưa
    const existing = await ShippingFee.findOne({ province, district: district || null });
    if (existing) {
      throw new AppError('Shipping fee for this location already exists', 409, 'SHIPPING_FEE_EXISTS');
    }

    const shippingFee = await ShippingFee.create({
      province,
      district: district || null,
      baseFee,
      perKgFee: perKgFee || 0,
      estimatedDays: estimatedDays || 3,
      description: description || ''
    });

    createdResponse(res, shippingFee, 'Shipping fee created successfully');
  } catch (err) {
    next(err);
  }
};

// Lấy danh sách phí vận chuyển
const getAllShippingFees = async (req, res, next) => {
  try {
    const { province, isActive } = req.query;
    let filter = {};

    if (province) {
      filter.province = { $regex: province, $options: 'i' };
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const shippingFees = await ShippingFee.find(filter).sort({ province: 1, district: 1 });
    successResponse(res, shippingFees, 'Shipping fees retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// Lấy chi tiết phí vận chuyển
const getShippingFeeDetail = async (req, res, next) => {
  try {
    const { shippingFeeId } = req.params;
    const shippingFee = await ShippingFee.findById(shippingFeeId);
    if (!shippingFee) throw new NotFoundError('Shipping fee not found');

    successResponse(res, shippingFee, 'Shipping fee retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// Cập nhật phí vận chuyển
const updateShippingFee = async (req, res, next) => {
  try {
    const { shippingFeeId } = req.params;
    const { province, district, baseFee, perKgFee, estimatedDays, isActive, description, isDelivered } = req.body;

    const updateData = {};
    if (province !== undefined) updateData.province = province;
    if (district !== undefined) updateData.district = district;
    if (baseFee !== undefined) updateData.baseFee = baseFee;
    if (perKgFee !== undefined) updateData.perKgFee = perKgFee;
    if (estimatedDays !== undefined) updateData.estimatedDays = estimatedDays;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isDelivered !== undefined) updateData.isDelivered = isDelivered;

    const shippingFee = await ShippingFee.findByIdAndUpdate(shippingFeeId, updateData, { new: true });
    if (!shippingFee) throw new NotFoundError('Shipping fee not found');

    successResponse(res, shippingFee, 'Shipping fee updated successfully');
  } catch (err) {
    next(err);
  }
};

// Xóa phí vận chuyển
const deleteShippingFee = async (req, res, next) => {
  try {
    const { shippingFeeId } = req.params;
    const shippingFee = await ShippingFee.findById(shippingFeeId);
    if (!shippingFee) throw new NotFoundError('Shipping fee not found');
    if (!shippingFee.isDelivered) throw new AppError('Chỉ được xóa phí vận chuyển đã giao xong', 400);
    await ShippingFee.findByIdAndDelete(shippingFeeId);
    successResponse(res, null, 'Shipping fee deleted successfully');
  } catch (err) {
    next(err);
  }
};

// Tính phí vận chuyển dựa trên địa chỉ
// req.body: { province, district, weight (kg - optional) }
const calculateShippingFee = async (req, res, next) => {
  try {
    const { province, district, weight } = req.body;

    if (!province) {
      throw new ValidationError('Province is required');
    }

    // Tìm phí vận chuyển: ưu tiên district cụ thể, nếu không có thì dùng province
    let shippingFee = await ShippingFee.findOne({
      province: { $regex: `^${province}$`, $options: 'i' },
      district: { $regex: `^${district}$`, $options: 'i' },
      isActive: true
    });

    if (!shippingFee && district) {
      // Nếu không có fee cụ thể cho district, tìm fee chung của province
      shippingFee = await ShippingFee.findOne({
        province: { $regex: `^${province}$`, $options: 'i' },
        district: null,
        isActive: true
      });
    }

    if (!shippingFee) {
      // Nếu không tìm thấy, dùng fee mặc định (có thể tạo một record mặc định)
      throw new AppError(
        'Shipping to this location is not available',
        400,
        'SHIPPING_NOT_AVAILABLE'
      );
    }

    // Tính phí: baseFee + (weight * perKgFee)
    let totalFee = shippingFee.baseFee;
    if (weight && shippingFee.perKgFee > 0) {
      totalFee += weight * shippingFee.perKgFee;
    }

    successResponse(res, {
      province: shippingFee.province,
      district: shippingFee.district,
      baseFee: shippingFee.baseFee,
      perKgFee: shippingFee.perKgFee,
      weight: weight || 0,
      totalFee,
      estimatedDays: shippingFee.estimatedDays,
      description: shippingFee.description
    }, 'Shipping fee calculated successfully');
  } catch (err) {
    next(err);
  }
};

// Lấy danh sách tỉnh/thành phố
const getProvinces = async (req, res, next) => {
  try {
    const provinces = await ShippingFee.distinct('province', { isActive: true });
    provinces.sort();
    successResponse(res, provinces, 'Provinces retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// Lấy danh sách quận/huyện theo tỉnh
const getDistrictsByProvince = async (req, res, next) => {
  try {
    const { province } = req.params;

    const districts = await ShippingFee.find(
      {
        province: { $regex: `^${province}$`, $options: 'i' },
        isActive: true
      },
      'district'
    );

    const districtList = districts
      .filter(d => d.district !== null)
      .map(d => d.district);

    successResponse(res, districtList, 'Districts retrieved successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createShippingFee,
  getAllShippingFees,
  getShippingFeeDetail,
  updateShippingFee,
  deleteShippingFee,
  calculateShippingFee,
  getProvinces,
  getDistrictsByProvince
};
