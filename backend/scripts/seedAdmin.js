// Creates the first administrator from environment variables.
// Usage:  npm run seed:admin
// Needs ADMIN_EMAIL and ADMIN_PASSWORD (and optionally ADMIN_NAME) in .env.
// Nothing is hardcoded; the password is stored only as a bcrypt hash.

import { validateEnv } from "../config/env.js";
import { connectDB, disconnectDB } from "../config/db.js";
import Admin from "../models/Admin.js";
import { isValidEmail, normalizeEmail } from "../utils/validators.js";

const run = async () => {
  validateEnv();

  const email = normalizeEmail(process.env.ADMIN_EMAIL);
  const password = process.env.ADMIN_PASSWORD || "";
  const name = process.env.ADMIN_NAME?.trim() || "CivicFix Admin";

  if (!isValidEmail(email)) throw new Error("Set a valid ADMIN_EMAIL in .env.");
  if (password.length < 8) throw new Error("ADMIN_PASSWORD must be at least 8 characters.");

  await connectDB();

  if (await Admin.exists({ email })) {
    console.log(`An admin with email ${email} already exists. Nothing changed.`);
    return;
  }

  await Admin.create({ name, email, password });
  console.log(`Admin created: ${email}`);
  console.log("You can now remove ADMIN_PASSWORD from .env.");
};

run()
  .catch((error) => {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(disconnectDB);
