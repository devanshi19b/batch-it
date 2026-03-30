const jwt = require("jsonwebtoken");
const { findUserById } = require("../repositories/user.repository");
const { JWT_SECRET } = require("../config/env");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, _res, next) => {
  const authorization = req.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    throw new AppError("Authentication token is required.", 401);
  }

  const token = authorization.split(" ")[1];

  let decoded;

  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    throw new AppError("Invalid or expired authentication token.", 401);
  }

  const user = await findUserById(decoded.id);

  if (!user) {
    throw new AppError("The authenticated user no longer exists.", 401);
  }

  req.user = {
    id: user._id?.toString?.() || user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  };

  next();
});

module.exports = {
  protect,
};
