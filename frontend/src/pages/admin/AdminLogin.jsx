import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";

import AuthLayout from "../../components/AuthLayout";
import FormField from "../../components/FormField";
import Loader from "../../components/Loader";
import useAuth from "../../hooks/useAuth";
import { isValidEmail } from "../../utils/helpers";

function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, adminLogin, loading: sessionLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (sessionLoading) {
    return <Loader label="Checking your session…" />;
  }

  if (admin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const validation = {};
    if (!email.trim()) validation.email = "Admin email is required.";
    else if (!isValidEmail(email)) validation.email = "Enter a valid email address.";
    if (!password) validation.password = "Password is required.";

    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);

    try {
      await adminLogin(email, password);
      navigate(location.state?.from || "/admin", { replace: true });
    } catch (error) {
      setErrors(error.fieldErrors || {});
      setFormError(error.fieldErrors ? "" : error.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      admin
      headline="Manage."
      highlight="Resolve. Improve."
      description="Manage reported civic issues, monitor complaint progress, and help ensure timely resolution."
      features={[
        "Manage citizen complaints",
        "Update complaint status",
        "Monitor issue resolution",
      ]}
      footerText="CivicFix Administration"
      title="Admin Login"
      subtitle="Sign in to access the administration panel"
    >
      {location.state?.message && (
        <div className="auth-error" role="alert">
          {location.state.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <FormField
          id="admin-email"
          label="Admin Email"
          icon={Mail}
          type="email"
          placeholder="Enter admin email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <FormField
          id="admin-password"
          label="Password"
          icon={Lock}
          type="password"
          placeholder="Enter admin password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        {formError && (
          <div className="auth-error" role="alert">
            {formError}
          </div>
        )}

        <button type="submit" className="auth-button" disabled={submitting}>
          {submitting ? "Logging in…" : "Admin Login"}
        </button>
      </form>

      <div className="admin-login-link">
        <span>Are you a citizen?</span>
        <Link to="/login">Citizen Login</Link>
      </div>

    </AuthLayout>
  );
}

export default AdminLogin;
