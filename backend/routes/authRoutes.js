import { Router } from "express";
import rateLimit from "express-rate-limit";

import { adminLogin, getMe, login, register } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Slows down password guessing and mass sign-ups.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again in a few minutes." },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/admin/login", authLimiter, adminLogin);
router.get("/me", protect, getMe);

export default router;
