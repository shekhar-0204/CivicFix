import bcrypt from "bcryptjs";

import Admin from "../models/Admin.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateToken } from "../utils/generateToken.js";
import {
  assertNoErrors,
  isString,
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  validatePassword,
} from "../utils/validators.js";

// Compared against when the email is unknown, so response time does not
// reveal which emails are registered.
const DUMMY_HASH = bcrypt.hashSync("civicfix-timing-guard", 12);

const checkCredentials = async (Model, email, password) => {
  const account = await Model.findOne({ email: normalizeEmail(email) }).select("+password");

  if (!account) {
    await bcrypt.compare(String(password), DUMMY_HASH);
    return null;
  }

  return (await account.matchPassword(String(password))) ? account : null;
};

const validateLoginBody = (body) => {
  const errors = {};

  if (!isString(body.email) || !body.email.trim()) errors.email = "Email is required.";
  else if (!isValidEmail(body.email)) errors.email = "Enter a valid email address.";

  if (!isString(body.password) || !body.password) errors.password = "Password is required.";

  assertNoErrors(errors);
};

// POST /api/auth/register  (creates the account only; the citizen logs in next)
export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, confirmPassword } = req.body ?? {};
  const errors = {};

  if (!isString(name) || !name.trim()) errors.name = "Full name is required.";
  if (!isString(email) || !email.trim()) errors.email = "Email is required.";
  else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
  if (!isString(phone) || !phone.trim()) errors.phone = "Phone number is required.";
  else if (!isValidPhone(phone)) errors.phone = "Enter a valid phone number.";

  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;
  if (!isString(confirmPassword) || !confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (confirmPassword !== password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  assertNoErrors(errors);

  if (await User.exists({ email: normalizeEmail(email) })) {
    throw ApiError.conflict("An account with this email already exists.");
  }

  const user = await User.create({
    name,
    email: normalizeEmail(email),
    phone,
    password,
  });

  res.status(201).json({
    success: true,
    message: "Account created. Please log in.",
    user,
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const body = req.body ?? {};
  validateLoginBody(body);

  const user = await checkCredentials(User, body.email, body.password);

  if (!user) {
    throw ApiError.unauthorized("Invalid email or password.");
  }

  res.json({
    success: true,
    token: generateToken({ id: user.id, role: "citizen" }, body.remember !== false),
    user,
  });
});

// POST /api/auth/admin/login
export const adminLogin = asyncHandler(async (req, res) => {
  const body = req.body ?? {};
  validateLoginBody(body);

  const admin = await checkCredentials(Admin, body.email, body.password);

  if (!admin) {
    throw ApiError.unauthorized("Invalid admin email or password.");
  }

  res.json({
    success: true,
    token: generateToken({ id: admin.id, role: "admin" }, false), // admin sessions are short-lived
    admin,
  });
});

// GET /api/auth/me  (works for either role)
export const getMe = asyncHandler(async (req, res) => {
  if (req.admin) {
    return res.json({ success: true, role: "admin", admin: req.admin });
  }

  res.json({ success: true, role: "citizen", user: req.user });
});
