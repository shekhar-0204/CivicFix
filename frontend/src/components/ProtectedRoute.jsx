import { Navigate, useLocation } from "react-router-dom";

import Loader from "./Loader";
import useAuth from "../hooks/useAuth";

// UI-level guard only. The real protection is on the API, which verifies the
// JWT and role on every request. Citizen routes need a logged-in citizen;
// admin routes need a logged-in admin.
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, admin, loading, sessionNotice } = useAuth();
  const location = useLocation();

  // While the stored token is being checked with the server.
  if (loading) {
    return <Loader label="Checking your session…" />;
  }

  const allowed = adminOnly ? Boolean(admin) : Boolean(user);

  if (!allowed) {
    return (
      <Navigate
        to={adminOnly ? "/admin/login" : "/login"}
        replace
        state={{ from: location.pathname + location.search, message: sessionNotice }}
      />
    );
  }

  return children;
}

export default ProtectedRoute;
