// Admin: Tạo tài khoản mới
const adminCreateUser = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }
    const { name, email, password, phone, role } = req.body;
    const existed = await User.findOne({ email });
    if (existed) {
      throw new ConflictError('Email already exists');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = role === 'admin' ? 'admin' : 'user';
    const user = await User.create({ name, email, passwordHash, phone, role: userRole });
    successResponse(res, { _id: user._id, name: user.name, email: user.email, role: user.role }, 'User created successfully');
  } catch (err) {
    next(err);
  }
};

// Admin: Update tài khoản user
const adminUpdateUser = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }
    const { userId } = req.params;
    const { name, phone, address, avatar, role } = req.body;
    const update = { name, phone, address, avatar };
    if (role) update.role = role;
    const user = await User.findByIdAndUpdate(userId, update, { new: true }).select('-passwordHash');
    if (!user) throw new NotFoundError('User not found');
    successResponse(res, user, 'User updated successfully');
  } catch (err) {
    next(err);
  }
};
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const logger = require('../utils/logger');
const { successResponse, createdResponse } = require('../utils/response');
const { ConflictError, UnauthorizedError, ForbiddenError, NotFoundError } = require('../middleware/errorHandler');
const { generateTokenPair } = require('../utils/tokenUtils');

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const requestId = req.id;

    logger.info(`User registration attempt: ${email}`, { requestId, email });

    const existed = await User.findOne({ email });
    if (existed) {
      logger.warn(`Registration failed: Email already exists: ${email}`, { requestId, email });
      throw new ConflictError('Email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = role === 'admin' ? 'admin' : 'user';
    const user = await User.create({ name, email, passwordHash, phone, role: userRole });

    logger.info(`User registered successfully: ${email}`, { requestId, userId: user._id });

    // Tạo cặp token (access + refresh)
    const { accessToken, refreshToken } = generateTokenPair(
      user._id.toString(),
      user.email,
      user.role
    );

    createdResponse(res, {
      accessToken,
      refreshToken,
      expiresIn: 900,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    }, 'User registered successfully');
  } catch (err) {
    logger.logError(`Registration failed: ${err.message}`, err, req.id);
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const requestId = req.id;

    logger.info(`Login attempt: ${email}`, { requestId, email });

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Login failed: User not found: ${email}`, { requestId, email });
      throw new UnauthorizedError('Invalid email or password');
    }
    if (user.isLocked) {
      logger.warn(`Login failed: Account locked: ${email}`, { requestId, email, userId: user._id });
      throw new ForbiddenError('Account is locked');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      logger.warn(`Login failed: Wrong password: ${email}`, { requestId, email });
      throw new UnauthorizedError('Invalid email or password');
    }

    user.lastLogin = new Date();
    await user.save();

    logger.info(`Login successful: ${email}`, { requestId, userId: user._id });

    // Tạo cặp token (access + refresh)
    const { accessToken, refreshToken } = generateTokenPair(
      user._id.toString(),
      user.email,
      user.role
    );

    successResponse(res, {
      accessToken,
      refreshToken,
      expiresIn: 900,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    }, 'Login successful');
  } catch (err) {
    logger.logError(`Login failed: ${err.message}`, err, req.id);
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedError('Unauthorized');

    const user = await User.findById(userId).select('-passwordHash');
    if (!user) throw new NotFoundError('User not found');
    successResponse(res, user, 'Profile retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedError('Unauthorized');

    const { name, phone, address, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone, address, avatar },
      { new: true }
    ).select('-passwordHash');

    if (!user) throw new NotFoundError('User not found');

    successResponse(res, user, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

const listCustomers = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({}).select('-passwordHash').skip(skip).limit(limit),
      User.countDocuments({})
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    successResponse(res, {
      items: users,
      pagination: { page, limit, total, totalPages }
    }, 'Customers list retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const lockAccount = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }

    const { userId } = req.params;
    const { isLocked } = req.body;

    const user = await User.findByIdAndUpdate(userId, { isLocked }, { new: true }).select('-passwordHash');
    if (!user) throw new NotFoundError('User not found');

    successResponse(res, user, `Account ${isLocked ? 'locked' : 'unlocked'} successfully`);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  listCustomers,
  lockAccount
  ,adminCreateUser
  ,adminUpdateUser
};
