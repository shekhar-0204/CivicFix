import { env } from "../config/env.js";
import ApiError from "../utils/ApiError.js";

export const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

// Single place where every error becomes a consistent JSON response:
// { success: false, message, errors? }
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  let status = err.statusCode || 500;
  let message = err.message || "Something went wrong.";
  let errors = err.details;
  let code = err.code && typeof err.code === "string" ? err.code : undefined;

  if (err.name === "ValidationError" && err.errors) {
    // Mongoose schema validation
    status = 400;
    message = "Please correct the highlighted fields.";
    errors = Object.fromEntries(
      Object.entries(err.errors).map(([field, detail]) => [field, detail.message])
    );
  } else if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}.`;
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || "value";
    message = `A record with this ${field} already exists.`;
  } else if (err.name === "MulterError") {
    status = 400;
    message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Image size must be less than 5MB."
        : err.code === "LIMIT_UNEXPECTED_FILE"
          ? "Unexpected file field. Send a single image in the \"photo\" field."
          : "Invalid file upload.";
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Malformed JSON in request body.";
  } else if (err.type === "entity.too.large") {
    status = 413;
    message = "Request body is too large.";
  } else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    status = 401;
    code = err.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "TOKEN_INVALID";
    message = "Invalid or expired token. Please log in again.";
  }

  // Never leak internals for unexpected errors.
  if (status >= 500) {
    console.error(`[${req.method} ${req.originalUrl}]`, err);
    if (!(err instanceof ApiError)) message = "Something went wrong. Please try again.";
  }

  res.status(status).json({
    success: false,
    message,
    ...(code && { code }),
    ...(errors && { errors }),
    ...(!env.isProduction && status >= 500 && { stack: err.stack }),
  });
};
