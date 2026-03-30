const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail } = require("../repositories/user.repository");
const { sendSuccess } = require("../utils/apiResponse");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { JWT_SECRET, TOKEN_EXPIRES_IN } = require("../config/env");
const { isNonEmptyString, isValidEmail } = require("../utils/validation");

const sanitizeUser = (user) => ({
  id: user._id?.toString?.() || user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const signToken = (user) =>
  jwt.sign(
    {
      id: user._id?.toString?.() || user.id,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  );

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedName = String(name || "").trim();
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!isNonEmptyString(normalizedName)) {
    throw new AppError("Name is required.", 400);
  }

  if (!isValidEmail(normalizedEmail)) {
    throw new AppError("A valid email address is required.", 400);
  }

  if (!password || String(password).length < 6) {
    throw new AppError("Password must be at least 6 characters long.", 400);
  }

  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new AppError("A user with that email already exists.", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUser({
    name: normalizedName,
    email: normalizedEmail,
    password: hashedPassword,
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: "User registered successfully.",
    data: {
      token: signToken(user),
      user: sanitizeUser(user),
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!isValidEmail(normalizedEmail) || !password) {
    throw new AppError("Email and password are required.", 400);
  }

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new AppError("Invalid email or password.", 401);
  }

  return sendSuccess(res, {
    message: "Login successful.",
    data: {
      token: signToken(user),
      user: sanitizeUser(user),
    },
  });
});

module.exports = {
  login,
  register,
};
