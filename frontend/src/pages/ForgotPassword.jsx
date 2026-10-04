import { Link } from "react-router-dom";
import { Info } from "lucide-react";

import AuthLayout from "../components/AuthLayout";

// Password reset by email is not supported by the backend yet, so this page
// says so honestly instead of pretending a reset link was sent.
function ForgotPassword() {
  return (
    <AuthLayout
      backTo="/login"
      backLabel="Back to Login"
      headline="Reset Your"
      highlight="Password."
      description="Having trouble signing in to your account?"
      features={[
        "Check that your email is spelled correctly",
        "Make sure Caps Lock is off",
        "Contact support if you are still locked out",
      ]}
      title="Password reset unavailable"
      subtitle="Resetting a password by email is not available right now."
    >
      <div className="auth-error" role="status">
        <Info size={17} />
        We can't send password reset emails yet. If you are logged in, you can change your
        password from Settings. Otherwise, please contact support for help.
      </div>

      <p className="auth-footer">
        Remember your password? <Link to="/login">Back to Login</Link>
      </p>
    </AuthLayout>
  );
}

export default ForgotPassword;
