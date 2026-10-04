import { useEffect, useMemo, useState } from "react";

import AuthContext from "./AuthContext";

import { setUnauthorizedHandler } from "../services/api";

import {
  changeAdminPassword,
  changePassword,
  hasStoredSession,
  loginAdmin,
  loginUser,
  logoutAdmin,
  logoutUser,
  registerUser,
  restoreSession,
  updateAdminProfile,
  updateCurrentUser,
} from "../services/authService";

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(hasStoredSession());
  const [sessionNotice, setSessionNotice] = useState("");

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      if (!hasStoredSession()) {
        if (!cancelled) {
          setLoading(false);
        }

        return;
      }

      try {
        const session = await restoreSession();

        if (cancelled) return;

        setUser(session.user);
        setAdmin(session.admin);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    restore();

    setUnauthorizedHandler((area, message) => {
      if (cancelled) return;

      setSessionNotice(
        message || "Your session has expired. Please log in again."
      );

      if (area === "admin") {
        logoutAdmin();
        setAdmin(null);
      } else {
        logoutUser();
        setUser(null);
      }
    });

    return () => {
      cancelled = true;
      setUnauthorizedHandler(null);
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      admin,
      loading,
      sessionNotice,

      login: async (email, password) => {
        const loggedIn = await loginUser(email, password);

        setSessionNotice("");
        setUser(loggedIn);
        setAdmin(null);

        return loggedIn;
      },

      register: registerUser,

      logout: () => {
        logoutUser();
        setSessionNotice("");
        setUser(null);
      },

      updateProfile: async (updates) => {
        const updated = await updateCurrentUser(updates);

        setUser(updated);

        return updated;
      },

      changePassword,

      adminLogin: async (email, password) => {
        const loggedIn = await loginAdmin(email, password);

        setSessionNotice("");
        setAdmin(loggedIn);
        setUser(null);

        return loggedIn;
      },

      adminLogout: () => {
        logoutAdmin();
        setSessionNotice("");
        setAdmin(null);
      },

      updateAdmin: async (updates) => {
        const updated = await updateAdminProfile(updates);

        setAdmin(updated);

        return updated;
      },

      changeAdminPassword,
    }),
    [user, admin, loading, sessionNotice]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;