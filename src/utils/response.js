// Standard success response helper
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

// For created resources
const createdResponse = (res, data, message = 'Resource created successfully') => {
  successResponse(res, data, message, 201);
};

module.exports = {
  successResponse,
  createdResponse
};
