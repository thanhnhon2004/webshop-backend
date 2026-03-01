const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { successResponse } = require('../utils/response');
const { NotFoundError, AppError } = require('../middleware/errorHandler');

const getCart = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) {
      return successResponse(res, { items: [], totalPrice: 0, totalItems: 0 }, 'Cart is empty');
    }
    successResponse(res, cart, 'Cart retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const addItem = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) throw new NotFoundError('Product not found');
    if (product.stock < quantity) throw new AppError('Not enough stock', 400, 'INSUFFICIENT_STOCK');

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity, price: product.price });
    }

    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    await cart.save();
    successResponse(res, cart, 'Product added to cart');
  } catch (err) {
    next(err);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) throw new NotFoundError('Cart not found');

    const item = cart.items.find(item => item.productId.toString() === productId);
    if (!item) throw new NotFoundError('Product not in cart');

    item.quantity = quantity;
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    await cart.save();
    successResponse(res, cart, 'Cart item updated');
  } catch (err) {
    next(err);
  }
};

const removeItem = async (req, res, next) => {
  try {
    const { userId, productId } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new NotFoundError('Cart not found');

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    await cart.save();
    successResponse(res, cart, 'Product removed from cart');
  } catch (err) {
    next(err);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { items: [], totalPrice: 0, totalItems: 0 },
      { new: true }
    );
    if (!cart) throw new NotFoundError('Cart not found');
    successResponse(res, cart, 'Cart cleared');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart
};
