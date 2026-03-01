const Joi = require('joi');
const { ValidationError } = require('./errorHandler');

// Generic validator factory
const validate = (schema, property = 'body') => (req, res, next) => {
  const data = req[property] || {};
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true, allowUnknown: false });
  if (error) {
    const details = error.details.map(d => ({ field: d.path.join('.'), message: d.message }));
    return next(new ValidationError('Validation failed', details));
  }
  req[property] = value;
  next();
};

// Schemas
const userRegisterSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(6).max(100).required(),
  phone: Joi.string().trim().optional(),
  role: Joi.string().valid('user', 'admin').default('user')
});

const userLoginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(6).max(100).required()
});

const productCreateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).required(),
  description: Joi.string().trim().min(5).required(),
  price: Joi.number().min(0).required(),
  image: Joi.string().required(), // Cho phép tên file hoặc URL
  images: Joi.array().items(Joi.string()).default([]), // Cho phép tên file hoặc URL
  stock: Joi.number().integer().min(0).required(),
  category: Joi.string().trim().required(),
  champion: Joi.string().trim().allow('', null),
  rating: Joi.number().min(0).max(5).optional(),
  isActive: Joi.boolean().optional()
});

const productUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).optional(),
  description: Joi.string().trim().min(5).optional().allow(''),
  price: Joi.number().min(0).optional(),
  image: Joi.string().optional().allow('', null),
  images: Joi.array().items(Joi.string()).optional().allow(null),
  stock: Joi.number().integer().min(0).optional(),
  category: Joi.string().trim().optional(),
  champion: Joi.string().trim().allow('', null).optional(),
  isActive: Joi.boolean().optional(),
  rating: Joi.number().min(0).max(5).optional(),
  sold: Joi.number().integer().min(0).optional()
}).min(1);

const productStockSchema = Joi.object({
  stock: Joi.number().integer().min(0).required()
});

const cartAddSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).default(1)
});

const cartUpdateSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required()
});

const checkoutSchema = Joi.object({
  paymentMethod: Joi.string().valid('credit_card', 'bank_transfer', 'cash_on_delivery').required(),
  shippingAddress: Joi.object({
    fullName: Joi.string().trim().min(2).required(),
    phone: Joi.string().trim().required(),
    email: Joi.string().trim().email().required(),
    address: Joi.string().trim().required(),
    ward: Joi.string().trim().allow('', null),
    district: Joi.string().trim().allow('', null),
    province: Joi.string().trim().required(),
    postalCode: Joi.string().trim().allow('', null)
  }).required(),
  voucherCode: Joi.string().trim().uppercase().allow('', null),
  weight: Joi.number().min(0).optional(),
  note: Joi.string().allow('', null)
});

const voucherSchema = Joi.object({
  code: Joi.string().trim().uppercase().min(3).max(20).required(),
  description: Joi.string().allow('', null),
  discountType: Joi.string().valid('percentage', 'fixed').required(),
  discountValue: Joi.number().min(0).required(),
  maxDiscount: Joi.number().min(0).allow(null),
  minOrderAmount: Joi.number().min(0).default(0),
  maxUses: Joi.number().integer().min(1).allow(null),
  maxUsesPerUser: Joi.number().integer().min(1).default(1),
  expiryDate: Joi.date().iso().required(),
  applicableCategories: Joi.array().items(
    Joi.string().valid('Figurine', 'Mô hình', 'Poster', 'Phụ kiện')
  ).allow(null),
  applicableProducts: Joi.array().items(Joi.string()).allow(null)
});

const voucherValidateSchema = Joi.object({
  code: Joi.string().trim().uppercase().required(),
  orderAmount: Joi.number().min(0).required(),
  userId: Joi.string().allow('', null),
  productIds: Joi.array().items(Joi.string()).allow(null),
  categories: Joi.array().items(Joi.string()).allow(null)
});

const shippingFeeSchema = Joi.object({
  province: Joi.string().trim().required(),
  district: Joi.string().trim().allow('', null),
  baseFee: Joi.number().min(0).required(),
  perKgFee: Joi.number().min(0).default(0),
  estimatedDays: Joi.number().integer().min(1).default(3),
  description: Joi.string().allow('', null)
});

module.exports = {
  validate,
  userRegisterSchema,
  userLoginSchema,
  productCreateSchema,
  productUpdateSchema,
  productStockSchema,
  cartAddSchema,
  cartUpdateSchema,
  checkoutSchema,
  voucherSchema,
  voucherValidateSchema,
  shippingFeeSchema
};
