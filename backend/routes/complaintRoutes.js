import { Router } from "express";

import {
  createComplaint,
  getMyComplaintById,
  getMyComplaints,
  getMyStats,
} from "../controllers/complaintController.js";
import { citizenOnly, protect } from "../middleware/authMiddleware.js";
import { uploadComplaintPhoto } from "../middleware/uploadMiddleware.js";

const router = Router();

router.use(protect, citizenOnly);

router.route("/").get(getMyComplaints).post(uploadComplaintPhoto, createComplaint);
router.get("/stats", getMyStats); // must stay above "/:id"
router.get("/:id", getMyComplaintById);

export default router;
