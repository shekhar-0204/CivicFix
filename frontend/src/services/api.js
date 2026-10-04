import axios from "axios";

const TOKEN_KEYS = {
  citizen: "civicfix_token",
  admin: "civicfix_admin_token",
};

export const getToken = (area) => {
  return sessionStorage.getItem(TOKEN_KEYS[area]);
};

export const hasToken = (area) => Boolean(getToken(area));

export const setToken = (area, token) => {
  sessionStorage.setItem(TOKEN_KEYS[area], token);
  localStorage.removeItem(TOKEN_KEYS[area]);
};

export const clearToken = (area) => {
  sessionStorage.removeItem(TOKEN_KEYS[area]);
  localStorage.removeItem(TOKEN_KEYS[area]);
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
});

let unauthorizedHandler = null;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/admin/login",
];

const isPublic = (config) => PUBLIC_PATHS.includes(config?.url);

const areaFor = (config) => {
  if (config?.area) return config.area;
  return config?.url?.startsWith("/admin") ? "admin" : "citizen";
};

api.interceptors.request.use((config) => {
  if (isPublic(config)) return config;

  const area = areaFor(config);
  const token = getToken(area);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const FALLBACK_MESSAGES = {
  400: "Some information is not valid.",
  401: "Your session has expired. Please log in again.",
  403: "You do not have permission to do this.",
  404: "Requested data was not found.",
  409: "This data already exists.",
  413: "File or request is too large.",
  422: "Some information could not be processed.",
  429: "Too many requests. Please try again later.",
  500: "Server error. Please try again later.",
  502: "Connected service failed.",
  503: "Service temporarily unavailable.",
};

const messageFor = (error) => {
  const data = error.response?.data;
  const status = error.response?.status;

  if (data?.message) return data.message;
  if (status) {
    return FALLBACK_MESSAGES[status] || "Something went wrong.";
  }

  if (
    error.code === "ECONNABORTED" ||
    error.code === "ETIMEDOUT"
  ) {
    return "Request timed out. Please try again.";
  }

  if (error.request) {
    return "Cannot reach the server.";
  }

  return "Something went wrong.";
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const data = error.response?.data;

    const friendly = new Error(messageFor(error));

    friendly.status = status;
    friendly.code = data?.code;
    friendly.fieldErrors = data?.errors || null;

    if (
      status === 401 &&
      !isPublic(error.config) &&
      error.config?.headers?.Authorization
    ) {
      const area = areaFor(error.config);

      clearToken(area);
      unauthorizedHandler?.(area, friendly.message);
    }

    return Promise.reject(friendly);
  }
);

export default api;