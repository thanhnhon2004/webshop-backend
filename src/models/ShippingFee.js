const mongoose = require('mongoose');

const shippingFeeSchema = new mongoose.Schema(
  {
    province: {
      type: String,
      required: true
    },
    district: {
      type: String,
      default: null // null = áp dụng cho toàn tỉnh
    },
    baseFee: {
      // Phí cơ bản (₫)
      type: Number,
      required: true,
      min: 0
    },
    perKgFee: {
      // Phí theo kg (₫/kg), nếu 0 = không tính
      type: Number,
      default: 0,
      min: 0
    },
    estimatedDays: {
      // Số ngày dự kiến giao hàng
      type: Number,
      default: 3,
      min: 1
    },
    description: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDelivered: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Index để tìm nhanh phí ship
shippingFeeSchema.index({ province: 1, district: 1 });
shippingFeeSchema.index({ isActive: 1 });

module.exports = mongoose.model('ShippingFee', shippingFeeSchema);
