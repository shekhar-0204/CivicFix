import dotenv from "dotenv";

dotenv.config();

const REQUIRED = ["MONGO_URI", "JWT_SECRET"];

// Fail fast with a clear message instead of crashing later with
// "secretOrPrivateKey must have a value".
export const validateEnv = () => {
  const missing = REQUIRED.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        "Copy .env.example to .env and fill them in."
    );
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long.");
  }

  // Photos are optional, so a missing cloudinary config is a warning, not a startup failure.
  const missingCloudinary = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ].filter((key) => !process.env[key]?.trim());

  if (missingCloudinary.length > 0) {
    console.warn(
      `Cloudinary is not fully configured (missing ${missingCloudinary.join(
        ", "
      )}). Complaints with photos will be rejected until it is.`
    );
  }
};

export const env = {
  get port() {
    return Number(process.env.PORT) || 5000;
  },
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },
  get clientOrigins() {
    return (process.env.CLIENT_URL || "http://localhost:5173")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);
  },
  get jwtExpiresIn() {
    return process.env.JWT_EXPIRES_IN || "7d";
  },
  get jwtSessionExpiresIn() {
    return process.env.JWT_SESSION_EXPIRES_IN || "1d";
  },
};
