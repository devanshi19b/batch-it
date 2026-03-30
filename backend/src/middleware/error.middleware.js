const AppError = require("../utils/appError");

const notFound = (req, _res, next) => {
  next(new AppError(`Route ${req.originalUrl} was not found.`, 404));
};

const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error.",
    ...(error.details ? { details: error.details } : {}),
  });
};

module.exports = {
  errorHandler,
  notFound,
};
