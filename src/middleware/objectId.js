const mongoose = require('mongoose');

const requireObjectId = (paramName) => (req, res, next) => {
  const value = req.params[paramName];
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return res.status(400).json({ error: `Invalid id for param ${paramName}` });
  }
  next();
};

module.exports = { requireObjectId };
