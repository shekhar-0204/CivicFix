import { Router } from "express";

import {
  changePassword,
  getAllComplaints,
  getComplaintById,
  getDashboard,
  getProfile,
  updateComplaintStatus,
  updateProfile,
} from "../controllers/adminController.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Every admin route is enforced here on the server, not only in React.
router.use(protect, adminOnly);

router.get("/dashboard", getDashboard);

router.get("/complaints", getAllComplaints);
router.get("/complaints/:id", getComplaintById);
router.patch("/complaints/:id/status", updateComplaintStatus);

router.route("/profile").get(getProfile).put(updateProfile);
router.put("/profile/password", changePassword);

export default router;
