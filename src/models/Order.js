const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    orderCode: {
      type: String,
      unique: true
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        productName: String,
        price: Number,
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        subtotal: Number
      }
    ],
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    discountCode: {
      type: String,
      default: null
    },
    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Voucher',
      default: null
    },
    shippingFeeData: {
      province: String,
      district: String,
      estimatedDays: Number
    },
    finalPrice: {
      type: Number
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'bank_transfer', 'cash_on_delivery'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    shippingAddress: {
      fullName: String,
      phone: String,
      email: String,
      address: String,
      ward: String,
      district: String,
      province: String,
      postalCode: String
    },
    note: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
