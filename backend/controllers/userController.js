import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateToken } from "../utils/generateToken.js";
import { assertNoErrors, isString, isValidPhone, validatePassword } from "../utils/validators.js";

// GET /api/users/me
export const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

// PUT /api/users/me   (email is the login identity and cannot be changed here)
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, location } = req.body ?? {};
  const errors = {};

  if (name !== undefined && (!isString(name) || !name.trim())) errors.name = "Name is required.";
  if (phone !== undefined && !isValidPhone(phone)) errors.phone = "Enter a valid phone number.";
  if (location !== undefined && !isString(location)) errors.location = "Location must be text.";

  assertNoErrors(errors);

  if (name !== undefined) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  if (location !== undefined) req.user.location = location;

  await req.user.save();

  res.json({ success: true, message: "Profile updated.", user: req.user });
});

// PUT /api/users/me/password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {};
  const errors = {};

  if (!isString(currentPassword) || !currentPassword) {
    errors.currentPassword = "Enter your current password.";
  }
  const passwordError = validatePassword(newPassword);
  if (passwordError) errors.newPassword = passwordError;

  assertNoErrors(errors);

  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.matchPassword(currentPassword))) {
    throw ApiError.badRequest("Current password is incorrect.", {
      currentPassword: "Current password is incorrect.",
    });
  }

  user.password = newPassword; // hashed by the model's pre-save hook
  await user.save();

  // Every older token is now invalid; hand back a fresh one so this session continues.
  res.json({
    success: true,
    message: "Password changed.",
    token: generateToken({ id: user.id, role: "citizen" }, true),
  });
});
