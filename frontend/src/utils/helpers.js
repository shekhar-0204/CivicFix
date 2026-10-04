export const STATUSES = ["Submitted", "In Progress", "Resolved"];

// UI hint only: which status button / pending timeline steps to show.
// The backend enforces the real rule (Submitted -> In Progress -> Resolved)
// and rejects anything else; its response is always the source of truth.
export const NEXT_STATUS = {
  Submitted: "In Progress",
  "In Progress": "Resolved",
  Resolved: null,
};

export const isValidEmail = (value = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

export const isValidPhone = (value = "") => {
  const digits = value.replace(/\D/g, "");
  return /^[+\d\s()-]+$/.test(value.trim()) && digits.length >= 10 && digits.length <= 13;
};

export const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CF";

export const statusSlug = (status = "") =>
  status.toLowerCase().replace(/\s+/g, "-");

export const truncate = (text = "", length = 80) =>
  text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

// The next status the UI should offer. If the API ever sends `nextStatus`
// on a complaint it wins; otherwise NEXT_STATUS is used purely for labels.
// The backend still validates every change.
export const getNextStatus = (complaint) =>
  "nextStatus" in complaint ? complaint.nextStatus : NEXT_STATUS[complaint.status] ?? null;

// -------------------------
// Dates
// -------------------------
// The API returns ISO timestamps (e.g. 2026-09-24T10:30:00.000Z). They are
// formatted only when rendered, in the viewer's local time, and never written
// back onto the API object. Formatting is done by hand because the month
// abbreviation from Intl differs between browsers ("Sep" vs "Sept").

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const pad = (number) => String(number).padStart(2, "0");

const toDate = (value) => {
  if (value === null || value === undefined || value === "") return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

// "24 Sep 2026"
export const formatDate = (value) => {
  const date = toDate(value);
  if (!date) return "";

  return `${pad(date.getDate())} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

// "24 Sep 2026, 09:40 am"
export const formatDateTime = (value) => {
  const date = toDate(value);
  if (!date) return "";

  const hours = date.getHours();
  const hour12 = hours % 12 || 12;

  return `${formatDate(date)}, ${pad(hour12)}:${pad(date.getMinutes())} ${hours < 12 ? "am" : "pm"}`;
};
