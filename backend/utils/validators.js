import ApiError from "./ApiError.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isString = (value) => typeof value === "string";

export const normalizeEmail = (email) => String(email ?? "").trim().toLowerCase();

export const isValidEmail = (email) => EMAIL_RE.test(normalizeEmail(email));

export const isValidPhone = (phone) => {
  const value = String(phone ?? "").trim();
  const digits = value.replace(/\D/g, "");
  return /^[+\d\s()-]+$/.test(value) && digits.length >= 10 && digits.length <= 13;
};

// Throws a 400 with per-field messages when `errors` is not empty.
export const assertNoErrors = (errors) => {
  if (Object.keys(errors).length > 0) {
    throw ApiError.badRequest("Please correct the highlighted fields.", errors);
  }
};

export const validatePassword = (password) => {
  if (!isString(password) || password.length < 6) return "Password must be at least 6 characters.";
  if (password.length > 72) return "Password must be at most 72 characters."; // bcrypt limit
  return null;
};
