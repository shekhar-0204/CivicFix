// Complaint API client. The backend (MongoDB + ImageKit) is the single
// source of truth: nothing is cached, generated or computed locally.
//
// The shared Axios client (./api) attaches the JWT automatically:
//   /admin/*  -> admin token
//   anything else -> citizen token
// Failed requests reject with a plain Error (see api.js): `message` is the
// backend message, `status` the HTTP status, `fieldErrors` per-field messages.

import api from "./api";

// Backend list endpoints cap `limit` at 100 per page.
const ADMIN_PAGE_SIZE = 100;

// A missing complaint is an expected outcome, not a failure: pages render
// their "Complaint not found" state for `null`. Anything else is re-thrown.
const nullIfNotFound = (error) => {
  if (error.status === 404) return null;
  throw error;
};

// -------------------------
// Citizen
// -------------------------

// GET /complaints  (the backend only returns the signed-in citizen's complaints)
export const getMyComplaints = async () => {
  const { data } = await api.get("/complaints");
  return data.complaints;
};

// GET /complaints/stats -> { total, submitted, inProgress, resolved }
export const getComplaintStats = async () => {
  const { data } = await api.get("/complaints/stats");
  return data.stats;
};

// GET /complaints/:id  (404 also covers other citizens' complaints)
export const getMyComplaintById = async (id) => {
  try {
    const { data } = await api.get(`/complaints/${encodeURIComponent(id)}`);
    return data.complaint;
  } catch (error) {
    return nullIfNotFound(error);
  }
};

// POST /complaints  (multipart/form-data: category, description, location, requestId, photo?)
// `image` must already be the optimized File (see utils/imageCompression.js).
// `requestId` identifies this one submission, so a retry or double click cannot
// create a duplicate complaint. The backend uploads the photo to ImageKit and
// returns the image URL on `complaint.photo`.
export const createComplaint = async ({
  category,
  description,
  location,
  image,
  requestId,
  onUploadProgress,
}) => {
  const body = new FormData();
  body.append("category", category);
  body.append("description", description.trim());
  body.append("location", location.trim());
  if (requestId) body.append("requestId", requestId);
  if (image) body.append("photo", image, image.name);

  const started = performance.now();

  // Axios sets the multipart boundary itself. Uploads can be slower than the
  // default 15s API timeout, so this request gets a longer one.
  const { data } = await api.post("/complaints", body, { timeout: 60000, onUploadProgress });

  if (import.meta.env.DEV) {
    console.info(`Total complaint request: ${((performance.now() - started) / 1000).toFixed(2)} sec`);
  }

  return data.complaint;
};

// -------------------------
// Admin
// -------------------------

// GET /admin/dashboard -> { stats, categories, recent }
//   stats:      { total, submitted, inProgress, resolved }
//   categories: [{ name, total, submitted, inProgress, resolved }]
//   recent:     the 5 newest complaints
export const getAdminDashboard = async () => {
  const { data } = await api.get("/admin/dashboard");
  return { stats: data.stats, categories: data.categories, recent: data.recent };
};

// Drops empty / "All" values so only real filters reach the query string.
const cleanParams = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "" && value !== "All"
    )
  );

// GET /admin/complaints?status=&category=&search=&page=&limit=
// Filtering and paging happen on the server. Returns one page:
//   { complaints, total, page, pages }
// `total` is the number of complaints matching the filters (not just this page).
export const getAdminComplaints = async ({ status, category, search, page = 1, limit = 50 } = {}) => {
  const { data } = await api.get("/admin/complaints", {
    params: cleanParams({ status, category, search: search?.trim(), page, limit }),
  });

  return {
    complaints: data.complaints,
    total: data.total,
    page: data.page,
    pages: data.pages,
  };
};

// Every complaint matching the (optional) filters, collected page by page.
// The admin list screen filters this list in the browser, so it needs all of it.
export const getAllAdminComplaints = async (filters = {}) => {
  const complaints = [];
  let page = 1;
  let pages;

  do {
    const result = await getAdminComplaints({ ...filters, page, limit: ADMIN_PAGE_SIZE });

    complaints.push(...result.complaints);
    pages = result.pages;
    page += 1;
  } while (page <= pages);

  return complaints;
};

// GET /admin/complaints/:id
export const getAdminComplaintById = async (id) => {
  try {
    const { data } = await api.get(`/admin/complaints/${encodeURIComponent(id)}`);
    return data.complaint;
  } catch (error) {
    return nullIfNotFound(error);
  }
};

// PATCH /admin/complaints/:id/status  body: { status }
// The backend validates the transition (Submitted -> In Progress -> Resolved)
// and returns the updated complaint, which callers should render as-is.
export const updateComplaintStatus = async (id, status) => {
  const { data } = await api.patch(`/admin/complaints/${encodeURIComponent(id)}/status`, {
    status,
  });
  return data.complaint;
};
