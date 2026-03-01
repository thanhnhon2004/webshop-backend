const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Voucher = require('../models/Voucher');
const ShippingFee = require('../models/ShippingFee');
const { successResponse, createdResponse } = require('../utils/response');
const { NotFoundError, AppError, ValidationError } = require('../middleware/errorHandler');

const generateOrderCode = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 100000);
  return `ORD-${year}${month}${day}-${random}`;
};

// Helper: Rollback stock khi lỗi
const rollbackStock = async (orderItems) => {
  for (const item of orderItems) {
    try {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity, sold: -item.quantity }
      });
    } catch (err) {
      console.error(`Failed to rollback stock for product ${item.productId}:`, err);
    }
  }
};

// Helper: Tính phí vận chuyển
const calculateShippingFee = async (province, district, weight = 0) => {
  try {
    // Tìm fee cụ thể cho quận/huyện
    let shippingFee = await ShippingFee.findOne({
      province: { $regex: `^${province}$`, $options: 'i' },
      district: { $regex: `^${district}$`, $options: 'i' },
      isActive: true
    });

    // Nếu không có, tìm fee chung của tỉnh
    if (!shippingFee && district) {
      shippingFee = await ShippingFee.findOne({
        province: { $regex: `^${province}$`, $options: 'i' },
        district: null,
        isActive: true
      });
    }

    if (!shippingFee) {
      // Fallback: phí mặc định 5000đ/kg
      const defaultFee = 5000 * (weight || 1);
      return {
        fee: defaultFee,
        data: {
          province,
          district,
          estimatedDays: 3,
          fallback: true
        }
      };
    }

    let totalFee = shippingFee.baseFee;
    if (weight && shippingFee.perKgFee > 0) {
      totalFee += weight * shippingFee.perKgFee;
    }

    return {
      fee: totalFee,
      data: {
        province: shippingFee.province,
        district: shippingFee.district,
        estimatedDays: shippingFee.estimatedDays
      }
    };
  } catch (err) {
    throw new AppError(
      'Failed to calculate shipping fee',
      500,
      'SHIPPING_FEE_ERROR'
    );
  }
};

// Helper: Validate & apply voucher
const applyVoucher = async (voucherCode, orderAmount, productIds, categories) => {
  if (!voucherCode) return { voucherId: null, discountCode: null, discountAmount: 0 };

  const voucher = await Voucher.findOne({ code: voucherCode.toUpperCase() });
  if (!voucher) {
    throw new AppError('Voucher not found', 404, 'VOUCHER_NOT_FOUND');
  }

  if (!voucher.isActive) {
    throw new AppError('Voucher is not active', 400, 'VOUCHER_INACTIVE');
  }

  const now = new Date();
  if (now > voucher.expiryDate) {
    throw new AppError('Voucher has expired', 400, 'VOUCHER_EXPIRED');
  }

  if (voucher.startDate && now < voucher.startDate) {
    throw new AppError('Voucher is not yet available', 400, 'VOUCHER_NOT_STARTED');
  }

  if (voucher.maxUses && voucher.currentUses >= voucher.maxUses) {
    throw new AppError('Voucher has reached maximum uses', 400, 'VOUCHER_MAX_USES_REACHED');
  }

  if (orderAmount < voucher.minOrderAmount) {
    throw new AppError(
      `Minimum order amount is ₫${voucher.minOrderAmount}`,
      400,
      'VOUCHER_MIN_ORDER_NOT_MET'
    );
  }

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

  let discountAmount = 0;
  if (voucher.discountType === 'percentage') {
    discountAmount = Math.round((orderAmount * voucher.discountValue) / 100);
    if (voucher.maxDiscount) {
      discountAmount = Math.min(discountAmount, voucher.maxDiscount);
    }
  } else {
    discountAmount = voucher.discountValue;
  }

  discountAmount = Math.min(discountAmount, orderAmount);

  return {
    voucherId: voucher._id,
    discountCode: voucher.code,
    discountAmount
  };
};

const checkout = async (req, res, next) => {
  const session = null; // Có thể dùng session nếu MongoDB Transactions
  const updatedProducts = []; // Track sản phẩm đã update để rollback

  try {
    const { userId } = req.params;
    const { paymentMethod, shippingAddress, note, voucherCode, weight } = req.body;

    // Validation cơ bản
    if (!paymentMethod || !shippingAddress) {
      throw new ValidationError('Missing required fields: paymentMethod, shippingAddress');
    }

    let cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400, 'CART_EMPTY');
    }
    // Loại bỏ item có productId null (sản phẩm đã bị xóa khỏi DB)
    const validItems = cart.items.filter(item => item.productId);
    if (validItems.length !== cart.items.length) {
      // Cập nhật lại cart để lần sau không bị lỗi
      cart.items = validItems;
      await cart.save();
    }
    if (validItems.length === 0) {
      throw new AppError('Cart is empty (all products removed)', 400, 'CART_EMPTY');
    }
    cart.items = validItems;

    // Bước 1: Kiểm tra stock & chuẩn bị orderItems
    const orderItems = [];
    let totalPrice = 0;
    const productIds = [];
    const categories = [];

    for (const item of cart.items) {
      const product = item.productId;
      if (product.stock < item.quantity) {
        throw new AppError(`Not enough stock for ${product.name}`, 400, 'INSUFFICIENT_STOCK');
      }

      const subtotal = product.price * item.quantity;
      orderItems.push({
        productId: product._id,
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal
      });
      totalPrice += subtotal;
      productIds.push(product._id.toString());
      if (product.category && !categories.includes(product.category)) {
        categories.push(product.category);
      }
    }

    // Bước 2: Tính phí vận chuyển
    let shippingFeeData = { fee: 0, data: {} };
    if (shippingAddress.province) {
      shippingFeeData = await calculateShippingFee(
        shippingAddress.province,
        shippingAddress.district,
        weight || 0
      );
    }

    // Bước 3: Validate & áp dụng voucher
    let voucherData = { voucherId: null, discountCode: null, discountAmount: 0 };
    if (voucherCode) {
      voucherData = await applyVoucher(voucherCode, totalPrice, productIds, categories);
    }

    // Bước 4: Tính finalPrice
    const finalPrice = totalPrice + shippingFeeData.fee - voucherData.discountAmount;

    // Bước 5: Update stock (TRẠ BACKUP để rollback nếu cần)
    for (const item of orderItems) {
      const result = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity, sold: item.quantity } },
        { new: true }
      );
      if (!result) {
        throw new AppError(`Not enough stock for product ${item.productId}`, 400, 'INSUFFICIENT_STOCK');
      }
      updatedProducts.push({
        productId: item.productId,
        quantity: item.quantity
      });
    }

    // Bước 6: Tạo order
    const orderCode = await generateOrderCode();
    const order = await Order.create({
      userId,
      orderCode,
      items: orderItems,
      totalPrice,
      shippingFee: shippingFeeData.fee,
      shippingFeeData: shippingFeeData.data,
      discountAmount: voucherData.discountAmount,
      discountCode: voucherData.discountCode,
      voucherId: voucherData.voucherId,
      finalPrice,
      paymentMethod,
      paymentStatus: 'pending',
      shippingAddress,
      note: note || '',
      status: 'pending'
    });

    // Bước 7: Update voucher (tăng current uses)
    if (voucherData.voucherId) {
      await Voucher.findByIdAndUpdate(
        voucherData.voucherId,
        { $inc: { currentUses: 1 } }
      );
    }

    // Bước 8: Clear cart
    await Cart.findOneAndUpdate({ userId }, { items: [], totalPrice: 0, totalItems: 0 });

    createdResponse(res, order, 'Order created successfully');
  } catch (err) {
    // ROLLBACK: Nếu lỗi xảy ra, trả lại stock
    if (updatedProducts.length > 0) {
      await rollbackStock(updatedProducts);
      console.error('Stock rollback completed due to checkout error');
    }
    // Log chi tiết lỗi checkout
    console.error('[CHECKOUT ERROR]', {
      message: err.message,
      code: err.code,
      stack: err.stack,
      data: {
        userId: req.params.userId,
        body: req.body
      }
    });
    next(err);
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const filter = { userId };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter).populate('items.productId');
    successResponse(res, orders, 'Orders retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const getOrderDetail = async (req, res, next) => {
  try {
    const { userId, orderId } = req.params;
    const order = await Order.findOne({ _id: orderId, userId }).populate('items.productId');
    if (!order) throw new NotFoundError('Order not found');
    successResponse(res, order, 'Order retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const adminGetAllOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, sortBy, startDate, endDate } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    let filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    let sort = { createdAt: -1 };
    if (sortBy === 'price_desc') sort = { finalPrice: -1 };
    if (sortBy === 'price_asc') sort = { finalPrice: 1 };

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email phone'),
      Order.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    successResponse(res, {
      items: orders,
      pagination: { page, limit, total, totalPages }
    }, 'All orders retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const validStatus = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
    if (!validStatus.includes(status)) {
      throw new ValidationError('Invalid status');
    }

    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) throw new NotFoundError('Order not found');

    if (status === 'cancelled') {
      // Rollback stock khi hủy đơn
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity, sold: -item.quantity }
        });
      }

      // Trả lại voucher usage nếu đơn đã dùng voucher
      if (order.voucherId) {
        await Voucher.findByIdAndUpdate(
          order.voucherId,
          { $inc: { currentUses: -1 } }
        );
      }
    }

    successResponse(res, order, 'Order status updated');
  } catch (err) {
    next(err);
  }
};

const updatePayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;
    const validStatus = ['pending', 'completed', 'failed'];
    if (!validStatus.includes(paymentStatus)) {
      throw new ValidationError('Invalid payment status');
    }

    const order = await Order.findByIdAndUpdate(orderId, { paymentStatus }, { new: true });
    if (!order) throw new NotFoundError('Order not found');

    successResponse(res, order, 'Payment status updated');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  checkout,
  getUserOrders,
  getOrderDetail,
  adminGetAllOrders,
  updateStatus,
  updatePayment
};
