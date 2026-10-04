import Admin from "../models/Admin.js";
import Complaint, {
  buildTimelineEntry,
  CATEGORIES,
  NEXT_STATUS,
  STATUSES,
} from "../models/Complaint.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateToken } from "../utils/generateToken.js";
import { assertNoErrors, isString, validatePassword } from "../utils/validators.js";

// Privacy: admin queries never populate or return the complaint owner.
// (Complaint's toJSON also strips `user`, this is a second line of defence.)
const ADMIN_PROJECTION = "-user";

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const countsFrom = (grouped) => {
  const countOf = (status) => grouped.find((item) => item._id === status)?.count || 0;

  return {
    total: grouped.reduce((sum, item) => sum + item.count, 0),
    submitted: countOf("Submitted"),
    inProgress: countOf("In Progress"),
    resolved: countOf("Resolved"),
  };
};

// GET /api/admin/dashboard
export const getDashboard = asyncHandler(async (_req, res) => {
  const [byStatus, byCategory, recent] = await Promise.all([
    Complaint.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Complaint.aggregate([
      { $group: { _id: { category: "$category", status: "$status" }, count: { $sum: 1 } } },
    ]),
    Complaint.find().select(ADMIN_PROJECTION).sort({ createdAt: -1 }).limit(5),
  ]);

  const categories = CATEGORIES.map((name) => {
    const rows = byCategory
      .filter((row) => row._id.category === name)
      .map((row) => ({ _id: row._id.status, count: row.count }));

    return { name, ...countsFrom(rows) };
  });

  res.json({ success: true, stats: countsFrom(byStatus), categories, recent });
});

// GET /api/admin/complaints?status=&category=&search=&page=&limit=
export const getAllComplaints = asyncHandler(async (req, res) => {
  const { status, category, search } = req.query;
  const filter = {};

  if (status !== undefined) {
    if (!STATUSES.includes(status)) throw ApiError.badRequest("Invalid status filter.");
    filter.status = status;
  }

  if (category !== undefined) {
    if (!CATEGORIES.includes(category)) throw ApiError.badRequest("Invalid category filter.");
    filter.category = category;
  }

  if (search !== undefined) {
    if (!isString(search)) throw ApiError.badRequest("Invalid search term.");

    const term = search.trim().slice(0, 100);
    if (term) {
      const pattern = new RegExp(escapeRegex(term), "i");
      filter.$or = [
        { complaintId: pattern },
        { title: pattern },
        { category: pattern },
        { location: pattern },
        { description: pattern },
      ];
    }
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);

  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .select(ADMIN_PROJECTION)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Complaint.countDocuments(filter),
  ]);

  res.json({
    success: true,
    total,
    page,
    pages: Math.max(Math.ceil(total / limit), 1),
    complaints,
  });
});

// GET /api/admin/complaints/:id
export const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findOne({ complaintId: req.params.id }).select(ADMIN_PROJECTION);

  if (!complaint) {
    throw ApiError.notFound("Complaint not found.");
  }

  res.json({ success: true, complaint });
});

// PATCH /api/admin/complaints/:id/status   body: { status }
// Only the next step is allowed: Submitted -> In Progress -> Resolved.
export const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { status } = req.body ?? {};

  if (!isString(status) || !STATUSES.includes(status)) {
    throw ApiError.badRequest(`Status must be one of: ${STATUSES.join(", ")}.`);
  }

  const complaint = await Complaint.findOne({ complaintId: req.params.id }).select(ADMIN_PROJECTION);

  if (!complaint) {
    throw ApiError.notFound("Complaint not found.");
  }

  const allowedNext = NEXT_STATUS[complaint.status];

  if (!allowedNext) {
    throw ApiError.badRequest("This complaint is already resolved and cannot be changed.");
  }

  if (status !== allowedNext) {
    throw ApiError.badRequest(
      `Invalid status change: ${complaint.status} to ${status}. ` +
        `The only allowed next status is ${allowedNext}.`
    );
  }

  // The filter includes the current status, so two admins clicking at once
  // cannot both apply (or skip) a step.
  const updated = await Complaint.findOneAndUpdate(
    { _id: complaint._id, status: complaint.status },
    { $set: { status }, $push: { timeline: buildTimelineEntry(status) } },
    { returnDocument: "after" }
  ); // `user` is removed by Complaint's toJSON, so the owner is never sent

  if (!updated) {
    throw ApiError.conflict("This complaint was just updated by someone else. Reload and try again.");
  }

  res.json({ success: true, message: `Status updated to ${status}.`, complaint: updated });
});

// GET /api/admin/profile
export const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// PUT /api/admin/profile   (name only; email and role are fixed)
export const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body ?? {};

  assertNoErrors(!isString(name) || !name.trim() ? { name: "Name is required." } : {});

  req.admin.name = name;
  await req.admin.save();

  res.json({ success: true, message: "Profile updated.", admin: req.admin });
});

// PUT /api/admin/profile/password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {};
  const errors = {};

  if (!isString(currentPassword) || !currentPassword) {
    errors.currentPassword = "Enter your current password.";
  }
  const passwordError = validatePassword(newPassword);
  if (passwordError) errors.newPassword = passwordError;

  assertNoErrors(errors);

  const admin = await Admin.findById(req.admin.id).select("+password");

  if (!(await admin.matchPassword(currentPassword))) {
    throw ApiError.badRequest("Current password is incorrect.", {
      currentPassword: "Current password is incorrect.",
    });
  }

  admin.password = newPassword;
  await admin.save();

  // Every older token is now invalid; hand back a fresh one so this session continues.
  res.json({
    success: true,
    message: "Password changed.",
    token: generateToken({ id: admin.id, role: "admin" }, false),
  });
});
