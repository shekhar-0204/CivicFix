import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Lock, Mail } from "lucide-react";

import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import Loader from "../components/Loader";
import useAuth from "../hooks/useAuth";
import { isValidEmail } from "../utils/helpers";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, loading: sessionLoading } = useAuth();

  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  if (sessionLoading) {
    return <Loader label="Checking your session…" />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const validate = () => {
    const next = {};

    if (!email.trim()) next.email = "Email is required.";
    else if (!isValidEmail(email)) next.email = "Enter a valid email address.";

    if (!password) next.password = "Password is required.";

    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const validation = validate();
    setErrors(validation);

    if (Object.keys(validation).length > 0) return;

    setLoading(true);

    try {
      await login(email, password, remember);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (error) {
      // Field-level errors from the API show under the fields; anything else in the banner.
      setErrors(error.fieldErrors || {});
      setFormError(error.fieldErrors ? "" : error.message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      headline="Report. Track."
      highlight="Improve Your City."
      description="Report civic issues in your area and track their resolution through one simple platform."
      features={[
        "Report civic issues easily",
        "Track your complaints",
        "Stay updated on resolutions",
      ]}
      title="Welcome Back"
      subtitle="Login to your CivicFix account"
    >
      {location.state?.registered && (
        <div className="auth-success" role="status">
          <CheckCircle2 size={17} />
          Account created. Log in to continue.
        </div>
      )}

      {!location.state?.registered && location.state?.message && (
        <div className="auth-error" role="alert">
          {location.state.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <FormField
          id="email"
          label="Email Address"
          icon={Mail}
          type="email"
          placeholder="Enter your email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <FormField
          id="password"
          label="Password"
          icon={Lock}
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          labelAside={
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          }
        />

        <div className="remember-row">
          <label className="remember-label">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Remember me</span>
          </label>
        </div>

        {formError && (
          <div className="auth-error" role="alert">
            {formError}
          </div>
        )}

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Logging in…" : "Login"}
        </button>
      </form>

      <p className="auth-footer">
        Don't have an account? <Link to="/register">Create Account</Link>
      </p>

      <div className="admin-login-link">
        <span>Are you an administrator?</span>
        <Link to="/admin/login">Admin Login</Link>
      </div>

    </AuthLayout>
  );
}

export default Login;
