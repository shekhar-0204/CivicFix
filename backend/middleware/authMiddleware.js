import Admin from "../models/Admin.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/generateToken.js";

const getBearerToken = (req) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" && token ? token : null;
};

// A token issued before the last password change is no longer valid.
const assertTokenNotStale = (payload, account) => {
  if (account.passwordChangedAt && payload.iat < Math.floor(account.passwordChangedAt.getTime() / 1000)) {
    throw ApiError.unauthorized(
      "Your password was changed. Please log in again.",
      "TOKEN_INVALID"
    );
  }
};

// Verifies the JWT, then loads the account from MongoDB so deleted accounts
// lose access immediately. Sets req.auth plus req.user (citizen) or req.admin.
export const protect = asyncHandler(async (req, _res, next) => {
  const token = getBearerToken(req);

  if (!token) {
    throw ApiError.unauthorized("Please log in to continue.", "NO_TOKEN");
  }

  let payload;

  try {
    payload = verifyToken(token);
  } catch (error) {
    throw error.name === "TokenExpiredError"
      ? ApiError.unauthorized("Your session has expired. Please log in again.", "TOKEN_EXPIRED")
      : ApiError.unauthorized("Invalid token. Please log in again.", "TOKEN_INVALID");
  }

  if (payload.role === "admin") {
    const admin = await Admin.findById(payload.id).select("+passwordChangedAt");
    if (!admin) throw ApiError.unauthorized("This admin account no longer exists.", "TOKEN_INVALID");
    assertTokenNotStale(payload, admin);
    req.admin = admin;
  } else if (payload.role === "citizen") {
    const user = await User.findById(payload.id).select("+passwordChangedAt");
    if (!user) throw ApiError.unauthorized("This account no longer exists.", "TOKEN_INVALID");
    assertTokenNotStale(payload, user);
    req.user = user;
  } else {
    throw ApiError.unauthorized("Invalid token. Please log in again.", "TOKEN_INVALID");
  }

  req.auth = { id: payload.id, role: payload.role };
  next();
});

// Role-based authorization. Use after `protect`.
// The role must come from the signed token AND the matching account must have
// been loaded from the right collection (User for "citizen", Admin for "admin").
export const authorize =
  (...roles) =>
  (req, _res, next) => {
    const account = req.auth?.role === "admin" ? req.admin : req.user;

    if (!req.auth || !account || !roles.includes(req.auth.role)) {
      return next(ApiError.forbidden("You do not have permission to access this resource."));
    }

    next();
  };

export const citizenOnly = authorize("citizen");
