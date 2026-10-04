import { Link } from "react-router-dom";
import { ArrowLeft, MapPin, ShieldCheck } from "lucide-react";

// Split-screen layout shared by Login, Register, Forgot Password and Admin Login.
// Desktop: branding left, form right. Mobile: stacked.
function AuthLayout({
  admin = false,
  backTo = "/",
  backLabel = "Back to Home",
  headline,
  highlight,
  description,
  features,
  footerText = "© 2026 CivicFix. Making cities better together.",
  title,
  subtitle,
  wide = false,
  children,
}) {
  const Icon = admin ? ShieldCheck : MapPin;
  const brandName = admin ? "CivicFix Admin" : "CivicFix";

  return (
    <div className="auth-page">
      <Link to={backTo} className="auth-back-home">
        <ArrowLeft size={17} />
        {backLabel}
      </Link>

      <div className="auth-container">
        <div className="auth-brand-panel">
          <div className="auth-brand-content">
            <div className="auth-brand-logo">
              <Icon size={30} />
            </div>

            <div className="auth-brand-name">{brandName}</div>

            <h1>
              {headline}
              <br />
              <span>{highlight}</span>
            </h1>

            <p>{description}</p>

            <div className="auth-features">
              {features.map((feature) => (
                <div className="auth-feature" key={feature}>
                  <span>✓</span>
                  <p>{feature}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="auth-brand-footer">{footerText}</div>
        </div>

        <div className="auth-form-panel">
          <div className={wide ? "auth-form-container register-form-container" : "auth-form-container"}>
            <div className="auth-mobile-logo">
              <Icon size={24} />
              <span>{brandName}</span>
            </div>

            <div className="auth-header">
              <h2>{title}</h2>
              <p>{subtitle}</p>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
