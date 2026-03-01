const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20
    },
    description: {
      type: String,
      default: ''
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0
    },
    // Nếu percentage: 0-100, nếu fixed: số tiền giảm
    maxDiscount: {
      // Giảm giá tối đa (dùng cho percentage)
      type: Number,
      default: null
    },
    minOrderAmount: {
      // Tối thiểu đơn hàng để dùng voucher
      type: Number,
      default: 0,
      min: 0
    },
    maxUses: {
      // Số lần dùng tối đa (null = unlimited)
      type: Number,
      default: null
    },
    currentUses: {
      // Số lần đã dùng
      type: Number,
      default: 0,
      min: 0
    },
    maxUsesPerUser: {
      // Tối đa lần dùng trên 1 user
      type: Number,
      default: 1
    },
    expiryDate: {
      type: Date,
      required: true
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    // Danh mục áp dụng (null = tất cả)
    applicableCategories: {
      type: [String],
      enum: ['Figurine', 'Mô hình', 'Poster', 'Phụ kiện', null],
      default: null
    },
    // Sản phẩm áp dụng (null = tất cả)
    applicableProducts: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Product',
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Index để tìm nhanh voucher
voucherSchema.index({ expiryDate: 1 });
voucherSchema.index({ isActive: 1 });

module.exports = mongoose.model('Voucher', voucherSchema);
