import { Router } from "express";

import { changePassword, getProfile, updateProfile } from "../controllers/userController.js";
import { citizenOnly, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect, citizenOnly);

router.route("/me").get(getProfile).put(updateProfile);
router.put("/me/password", changePassword);

export default router;
