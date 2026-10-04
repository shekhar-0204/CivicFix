import crypto from "node:crypto";

import mongoose from "mongoose";

export const CATEGORIES = [
  "Water Leakage",
  "Pothole",
  "Street Light",
  "Garbage",
  "Drainage",
  "Traffic Signal",
  "Other",
];

export const STATUSES = ["Submitted", "In Progress", "Resolved"];

// The only legal moves. Anything else (skipping or going back) is rejected.
export const NEXT_STATUS = {
  Submitted: "In Progress",
  "In Progress": "Resolved",
  Resolved: null,
};

const TIMELINE_COPY = {
  Submitted: {
    title: "Complaint Submitted",
    description: "Your complaint was successfully submitted.",
  },
  "In Progress": {
    title: "Work in Progress",
    description: "The issue has been assigned for resolution.",
  },
  Resolved: {
    title: "Issue Resolved",
    description: "The reported issue has been resolved.",
  },
};

export const buildTimelineEntry = (status) => ({
  ...TIMELINE_COPY[status],
  status,
  date: new Date(),
});

const timelineSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: STATUSES, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    // Public, human-friendly ID shown in the UI (e.g. CF482913).
    complaintId: { type: String, unique: true },
    // Owner. Never exposed in API responses (see toJSON below).
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
    location: { type: String, required: true, trim: true, maxlength: 200 },
    status: { type: String, enum: STATUSES, default: "Submitted", index: true },
    photo: {
      url: { type: String },
      fileId: { type: String }, // cloudinary public_ID (used to delete the image if saving fails)
    },
    timeline: { type: [timelineSchema], default: [] },
    // Client-generated ID for one form submission. Together with `user` it makes a
    // double-click / retry return the same complaint instead of creating a second one.
    requestId: { type: String, maxlength: 64 },
  },
  { timestamps: true }
);

complaintSchema.index(
  { user: 1, requestId: 1 },
  { unique: true, partialFilterExpression: { requestId: { $type: "string" } } }
);

// Random 6-digit ID; the caller retries on the (unlikely) unique-index collision.
complaintSchema.statics.generateComplaintId = () => `CF${crypto.randomInt(100000, 1000000)}`;

complaintSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret.complaintId;
    ret.photo = ret.photo?.url || null; // the frontend expects a URL string
    ret.date = ret.createdAt;
    delete ret._id;
    delete ret.__v;
    delete ret.complaintId;
    delete ret.user; // privacy: the owner is never sent to any client
    delete ret.requestId;
    return ret;
  },
});

export default mongoose.model("Complaint", complaintSchema);
