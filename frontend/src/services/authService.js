import api, { clearToken, hasToken, setToken } from "./api";

[
  "civicfix_users",
  "civicfix_current_user",
  "civicfix_admin_profile",
  "civicfix_admin_session",
].forEach((key) => {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
});

let currentUser = null;
let currentAdmin = null;

export const getCurrentUser = () => currentUser;
export const getCurrentAdmin = () => currentAdmin;

export const restoreSession = async () => {
  let user = null;
  let admin = null;

  if (hasToken("citizen")) {
    try {
      const response = await api.get("/auth/me", {
        area: "citizen",
      });

      user = response.data.user ?? null;
    } catch {
      clearToken("citizen");
    }
  }

  if (hasToken("admin")) {
    try {
      const response = await api.get("/auth/me", {
        area: "admin",
      });

      admin = response.data.admin ?? null;
    } catch {
      clearToken("admin");
    }
  }

  currentUser = user;
  currentAdmin = admin;

  return { user, admin };
};

export const hasStoredSession = () => {
  return hasToken("citizen") || hasToken("admin");
};

export const registerUser = async (userData) => {
  const { data } = await api.post("/auth/register", {
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    password: userData.password,
    confirmPassword: userData.confirmPassword,
  });

  return data.user;
};

export const loginUser = async (email, password) => {
  const { data } = await api.post("/auth/login", {
    email,
    password,
  });

  setToken("citizen", data.token);

  currentUser = data.user;
  currentAdmin = null;

  return data.user;
};

export const logoutUser = () => {
  clearToken("citizen");
  currentUser = null;
};

export const updateCurrentUser = async (updates) => {
  const { data } = await api.put("/users/me", updates);

  currentUser = data.user;

  return data.user;
};

export const changePassword = async (
  currentPassword,
  newPassword
) => {
  const { data } = await api.put("/users/me/password", {
    currentPassword,
    newPassword,
  });

  if (data?.token) {
    setToken("citizen", data.token);
  }

  if (data?.user) {
    currentUser = data.user;
  }
};

export const PASSWORD_RESET_AVAILABLE = false;

export const loginAdmin = async (email, password) => {
  const { data } = await api.post("/auth/admin/login", {
    email,
    password,
  });

  setToken("admin", data.token);

  currentAdmin = data.admin;
  currentUser = null;

  return data.admin;
};

export const logoutAdmin = () => {
  clearToken("admin");
  currentAdmin = null;
};

export const updateAdminProfile = async (updates) => {
  const { data } = await api.put("/admin/profile", {
    name: updates.name,
  });

  currentAdmin = data.admin;

  return data.admin;
};

export const changeAdminPassword = async (
  currentPassword,
  newPassword
) => {
  const { data } = await api.put("/admin/profile/password", {
    currentPassword,
    newPassword,
  });

  if (data?.token) {
    setToken("admin", data.token);
  }

  if (data?.admin) {
    currentAdmin = data.admin;
  }
};