const Product = require('../models/Product');
const { successResponse, createdResponse } = require('../utils/response');
const { NotFoundError, ValidationError } = require('../middleware/errorHandler');
const { getImageUrl } = require('./uploadController');

const getAll = async (req, res, next) => {
  try {
    const { category, champion, minPrice, maxPrice, sort, search } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    let filter = { isActive: true };
    if (category) filter.category = category;
    if (champion) filter.champion = champion;
    if (search) {
      const keyword = new RegExp(search, 'i');
      filter.$or = [{ name: keyword }, { champion: keyword }];
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sortBy = { createdAt: -1 };
    if (sort) {
      // Support MongoDB-style sort: '-field' for desc, 'field' for asc
      if (sort.startsWith('-')) {
        const field = sort.substring(1);
        sortBy = { [field]: -1 };
      } else if (sort === 'price_asc') {
        sortBy = { price: 1 };
      } else if (sort === 'price_desc') {
        sortBy = { price: -1 };
      } else if (sort === 'popular') {
        sortBy = { sold: -1 };
      } else if (sort === 'rating') {
        sortBy = { rating: -1 };
      } else if (sort === 'createdAt') {
        sortBy = { createdAt: 1 };
      } else {
        sortBy = { [sort]: 1 };
      }
    }

    let [products, total] = await Promise.all([
      Product.find(filter).sort(sortBy).skip(skip).limit(limit),
      Product.countDocuments(filter)
    ]);

    // Normalize image paths to full URLs
    products = products.map(p => {
      const obj = p.toObject();
      if (obj.image) {
        obj.image = getImageUrl(obj.image);
      }
      if (obj.images && Array.isArray(obj.images)) {
        obj.images = obj.images.map(img => (img ? getImageUrl(img) : img));
      }
      return obj;
    });

    const totalPages = Math.ceil(total / limit) || 1;

    successResponse(res, {
      items: products,
      pagination: { page, limit, total, totalPages }
    }, 'Products retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const getDetail = async (req, res, next) => {
  try {
    const { productId } = req.params;
    let product = await Product.findById(productId);
    if (!product) throw new NotFoundError('Product not found');

    // convert image urls
    product = product.toObject();
    if (product.image) {
      product.image = getImageUrl(product.image);
    }
    if (product.images && Array.isArray(product.images)) {
      product.images = product.images.map(img => (img ? getImageUrl(img) : img));
    }

    successResponse(res, product, 'Product retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, description, price, image, images, stock, category, champion } = req.body;
    
    // Accept either full URLs or uploaded filenames/paths for images
    if (image && typeof image !== 'string') {
      throw new ValidationError('Image must be a URL or filename string');
    }
    if (images && !Array.isArray(images)) {
      throw new ValidationError('Images must be an array of URL or filename strings');
    }

    const product = await Product.create({
      name,
      description,
      price,
      image,
      images: images || [],
      stock,
      category,
      champion,
      isActive: true
    });
    createdResponse(res, product, 'Product created successfully');
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { name, description, price, image, images, stock, category, champion, isActive } = req.body;

    const product = await Product.findByIdAndUpdate(
      productId,
      { name, description, price, image, images, stock, category, champion, isActive },
      { new: true, runValidators: true }
    );
    if (!product) throw new NotFoundError('Product not found');
    successResponse(res, product, 'Product updated successfully');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByIdAndDelete(productId);
    if (!product) throw new NotFoundError('Product not found');
    successResponse(res, product, 'Product deleted successfully');
  } catch (err) {
    next(err);
  }
};

const updateStock = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { stock } = req.body;

    const product = await Product.findByIdAndUpdate(
      productId,
      { stock },
      { new: true, runValidators: true }
    );
    if (!product) throw new NotFoundError('Product not found');
    successResponse(res, product, 'Stock updated successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getDetail,
  create,
  update,
  remove,
  updateStock
};
