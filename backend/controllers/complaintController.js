import Complaint, {
  buildTimelineEntry,
  CATEGORIES,
  STATUSES,
} from "../models/Complaint.js";
import {
  deleteImage,
  uploadImage,
} from "../services/cloudinaryService.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { assertNoErrors, isString } from "../utils/validators.js";

const TITLES = {
  "Water Leakage": "Roadside water leakage",
  Pothole: "Damaged road / pothole",
  "Street Light": "Street light not working",
  Garbage: "Garbage accumulation",
  Drainage: "Blocked drainage",
  "Traffic Signal": "Traffic signal not working",
  Other: "Civic issue reported",
};

const MAX_ID_ATTEMPTS = 5;
const REQUEST_ID_RE = /^[A-Za-z0-9-]{8,64}$/;

// Temporary timing logs. Enable with PERF_LOG=true in backend/.env, then remove
// the `perf` calls (or leave the variable unset) once you are done measuring.
const perfLogEnabled = () => process.env.PERF_LOG === "true";
const seconds = (ms) => `${(ms / 1000).toFixed(2)} sec`;
const megabytes = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

// Submissions currently being processed ("userId:requestId"), so a second click
// that arrives while the first is still uploading is rejected instead of duplicated.
const inFlight = new Set();

// POST /api/complaints   (multipart/form-data: category, description, location, requestId?, photo?)
export const createComplaint = asyncHandler(async (req, res) => {
  const startedAt = performance.now();
  const { category, description, location } = req.body ?? {};
  const errors = {};

  if (!isString(category) || !CATEGORIES.includes(category)) {
    errors.category = "Select a valid issue category.";
  }
  if (!isString(description) || !description.trim()) errors.description = "Describe the problem.";
  else if (description.trim().length < 10) {
    errors.description = "Add a little more detail (at least 10 characters).";
  } else if (description.trim().length > 2000) {
    errors.description = "Description must be at most 2000 characters.";
  }
  if (!isString(location) || !location.trim()) errors.location = "Enter the location of the issue.";
  else if (location.trim().length > 200) errors.location = "Location must be at most 200 characters.";

  assertNoErrors(errors);

  const requestId =
    isString(req.body?.requestId) && REQUEST_ID_RE.test(req.body.requestId)
      ? req.body.requestId
      : undefined;

  // Same submission sent again (double click, retry after a timeout): return the original.
  if (requestId) {
    const existing = await Complaint.findOne({ user: req.user._id, requestId });
    if (existing) {
      return res.status(200).json({ success: true, message: "Complaint submitted.", complaint: existing });
    }
  }

  const lockKey = requestId ? `${req.user.id}:${requestId}` : null;
  if (lockKey) {
    if (inFlight.has(lockKey)) {
      throw ApiError.conflict("This complaint is already being submitted. Please wait a moment.");
    }
    inFlight.add(lockKey);
  }

  let photo;

  try {
    // Upload first. If it fails nothing has been saved, so there is no half-finished complaint.
    let uploadMs = 0;
    if (req.file) {
      const uploadStart = performance.now();
      photo = await uploadImage(req.file.buffer, req.file.originalname);
      uploadMs = performance.now() - uploadStart;
    }

    const saveStart = performance.now();
    let complaint;

    for (let attempt = 1; attempt <= MAX_ID_ATTEMPTS; attempt += 1) {
      try {
        complaint = await Complaint.create({
          complaintId: Complaint.generateComplaintId(),
          user: req.user._id,
          title: TITLES[category],
          category,
          description,
          location,
          status: "Submitted",
          photo,
          timeline: [buildTimelineEntry("Submitted")],
          requestId,
        });
        break;
      } catch (error) {
        const idCollision = error.code === 11000 && error.keyPattern?.complaintId;
        if (!idCollision || attempt === MAX_ID_ATTEMPTS) throw error;
      }
    }

    if (perfLogEnabled()) {
      console.log(
        [
          req.file ? `Received image: ${megabytes(req.file.size)}` : "No image attached",
          `Cloudinary upload: ${req.file ? seconds(uploadMs) : "skipped"}`,
          `MongoDB save: ${seconds(performance.now() - saveStart)}`,
          `Total API: ${seconds(performance.now() - startedAt)}`,
        ].join("\n")
      );
    }

    return res.status(201).json({ success: true, message: "Complaint submitted.", complaint });
  } catch (error) {
    // Saving failed after the image was uploaded: remove the orphaned image.
    await deleteImage(photo?.fileId);

    // Lost a race against the same requestId: return the complaint that won.
    if (error.code === 11000 && error.keyPattern?.requestId) {
      const existing = await Complaint.findOne({ user: req.user._id, requestId });
      if (existing) {
        return res.status(200).json({ success: true, message: "Complaint submitted.", complaint: existing });
      }
    }

    throw error;
  } finally {
    if (lockKey) inFlight.delete(lockKey);
  }
});

// GET /api/complaints   (only the logged-in citizen's complaints; ?status=)
export const getMyComplaints = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };

  if (req.query.status !== undefined) {
    if (!STATUSES.includes(req.query.status)) {
      throw ApiError.badRequest("Invalid status filter.");
    }
    filter.status = req.query.status;
  }

  const complaints = await Complaint.find(filter).sort({ createdAt: -1 });

  res.json({ success: true, count: complaints.length, complaints });
});

// GET /api/complaints/stats
export const getMyStats = asyncHandler(async (req, res) => {
  const grouped = await Complaint.aggregate([
    { $match: { user: req.user._id } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const countOf = (status) => grouped.find((item) => item._id === status)?.count || 0;

  res.json({
    success: true,
    stats: {
      total: grouped.reduce((sum, item) => sum + item.count, 0),
      submitted: countOf("Submitted"),
      inProgress: countOf("In Progress"),
      resolved: countOf("Resolved"),
    },
  });
});

// GET /api/complaints/:id   (404 for anyone else's complaint, so IDs cannot be probed)
export const getMyComplaintById = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findOne({
    complaintId: req.params.id,
    user: req.user._id,
  });

  if (!complaint) {
    throw ApiError.notFound("Complaint not found.");
  }

  res.json({ success: true, complaint });
});
