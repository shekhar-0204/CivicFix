import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Lock, Mail, Phone, User } from "lucide-react";

import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import Loader from "../components/Loader";
import useAuth from "../hooks/useAuth";
import { isValidEmail, isValidPhone } from "../utils/helpers";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

function Register() {
  const navigate = useNavigate();
  const { user, register, loading: sessionLoading } = useAuth();

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  if (sessionLoading) {
    return <Loader label="Checking your session…" />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const passwordsMatch = form.confirmPassword !== "" && form.confirmPassword === form.password;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({
      ...previous,
      [name]: "",
      ...(name === "password" && { confirmPassword: "" }),
    }));
  };

  const validate = () => {
    const next = {};

    if (!form.name.trim()) next.name = "Full name is required.";

    if (!form.email.trim()) next.email = "Email is required.";
    else if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";

    if (!form.phone.trim()) next.phone = "Phone number is required.";
    else if (!isValidPhone(form.phone)) next.phone = "Enter a valid phone number.";

    if (!form.password) next.password = "Password is required.";
    else if (form.password.length < 6) next.password = "Use at least 6 characters.";

    if (!form.confirmPassword) next.confirmPassword = "Confirm your password.";
    else if (form.confirmPassword !== form.password)
      next.confirmPassword = "Passwords do not match.";

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
      await register(form);
      navigate("/login", {
        replace: true,
        state: { registered: true, email: form.email.trim() },
      });
    } catch (error) {
      setErrors(error.fieldErrors || {});
      setFormError(error.fieldErrors ? "" : error.message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      wide
      headline="Join CivicFix."
      highlight="Make a Difference."
      description="Create your account and start reporting civic issues in your area."
      features={[
        "Report problems in your locality",
        "Track complaint progress",
        "Help build a better community",
      ]}
      title="Create Your Account"
      subtitle="Join CivicFix and help improve your city"
    >
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <FormField
          id="name"
          name="name"
          label="Full Name"
          icon={User}
          placeholder="Enter your full name"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
        />

        <FormField
          id="email"
          name="email"
          label="Email Address"
          icon={Mail}
          type="email"
          placeholder="Enter your email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />

        <FormField
          id="phone"
          name="phone"
          label="Phone Number"
          icon={Phone}
          type="tel"
          placeholder="Enter your phone number"
          autoComplete="tel"
          value={form.phone}
          onChange={handleChange}
          error={errors.phone}
        />

        <FormField
          id="password"
          name="password"
          label="Password"
          icon={Lock}
          type="password"
          placeholder="Create a password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />

        <FormField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          icon={Lock}
          type="password"
          placeholder="Confirm your password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        {form.confirmPassword && !errors.confirmPassword && (
          <p
            className={passwordsMatch ? "field-success" : "field-error"}
            role="status"
            aria-live="polite"
            style={{ marginTop: "-8px" }}
          >
            {passwordsMatch ? "Passwords match" : "Passwords do not match"}
          </p>
        )}

        {formError && (
          <div className="auth-error" role="alert">
            {formError}
          </div>
        )}

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="auth-footer">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </AuthLayout>
  );
}

export default Register;
