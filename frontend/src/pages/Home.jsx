import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  BellRing,
  Camera,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Eye,
  FileText,
  Mail,
  MapPin,
  Phone,
  Smartphone,
  Users,
  Wrench,
} from "lucide-react";

import Footer from "../components/Footer";
import Header from "../components/Header";
import { CATEGORIES } from "../data/categories";
import useAuth from "../hooks/useAuth";
import { isValidEmail } from "../utils/helpers";

const STEPS = [
  { title: "Report Issue", text: "Pick a category, add a photo and the location.", icon: Camera },
  { title: "Complaint Reviewed", text: "The civic team checks the report and its details.", icon: Eye },
  { title: "Work In Progress", text: "The issue is assigned and work begins.", icon: Wrench },
  { title: "Issue Resolved", text: "The status is updated and the complaint is closed.", icon: CheckCircle2 },
];

const SERVICES = [
  { title: "Civic Issue Reporting", text: "Submit a problem in a minute, with a photo and location.", icon: FileText },
  { title: "Complaint Tracking", text: "Follow every complaint from submission to resolution.", icon: ClipboardList },
  { title: "Issue Status Updates", text: "See each change of status on a clear timeline.", icon: BellRing },
  { title: "Local Issue Management", text: "Admins review, prioritise and update complaints.", icon: MapPin },
  { title: "Community Reporting", text: "Neighbours reporting together highlight what matters most.", icon: Users },
];

const REASONS = [
  { title: "Quick to use", text: "Reporting takes a few fields, not a long form.", icon: Clock3 },
  { title: "Always visible", text: "You can always see where your complaint stands.", icon: Eye },
  { title: "Evidence attached", text: "Photos and locations help teams find the problem.", icon: Camera },
  { title: "Works on any device", text: "Report from your phone while you are on the street.", icon: Smartphone },
];

function HeroIllustration() {
  return (
    <svg viewBox="0 0 520 400" className="hm-illustration" role="img" aria-label="Illustration of a city street with a street light and a location marker">
      <rect width="520" height="400" rx="18" fill="#ccfbf1" />
      <circle cx="420" cy="80" r="34" fill="#f8fafc" />
      <rect x="30" y="150" width="70" height="170" fill="#99f6e4" />
      <rect x="110" y="110" width="80" height="210" fill="#5eead4" />
      <rect x="200" y="170" width="60" height="150" fill="#99f6e4" />
      <rect x="340" y="130" width="90" height="190" fill="#5eead4" />
      <rect x="440" y="180" width="60" height="140" fill="#99f6e4" />
      <g fill="#f0fdfa">
        <rect x="125" y="130" width="14" height="14" /><rect x="150" y="130" width="14" height="14" />
        <rect x="125" y="160" width="14" height="14" /><rect x="150" y="160" width="14" height="14" />
        <rect x="355" y="150" width="14" height="14" /><rect x="385" y="150" width="14" height="14" />
        <rect x="355" y="180" width="14" height="14" /><rect x="385" y="180" width="14" height="14" />
      </g>
      <rect y="320" width="520" height="80" fill="#0f766e" />
      <rect y="352" width="520" height="4" fill="#ccfbf1" opacity=".7" />
      <rect x="280" y="150" width="8" height="170" fill="#0f172a" />
      <path d="M284 152 H330" stroke="#0f172a" strokeWidth="8" />
      <rect x="318" y="146" width="30" height="12" rx="5" fill="#0f172a" />
      <path d="M322 158 L302 320 H364 L344 158Z" fill="#fde68a" opacity=".35" />
      <path d="M440 300 c0 -34 -42 -34 -42 0 c0 22 21 38 21 38 s21 -16 21 -38z" fill="#0f172a" />
      <circle cx="419" cy="292" r="8" fill="#ccfbf1" />
    </svg>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setSent(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const next = {};
    if (!form.name.trim()) next.name = "Enter your name.";
    if (!form.email.trim()) next.email = "Enter your email.";
    else if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";
    if (form.message.trim().length < 10) next.message = "Write at least 10 characters.";

    setErrors(next);

    // Frontend only: nothing is sent anywhere yet.
    if (Object.keys(next).length === 0) {
      setSent(true);
      setForm({ name: "", email: "", message: "" });
    }
  };

  return (
    <form className="hm-contact-form" onSubmit={handleSubmit} noValidate>
      {["name", "email"].map((field) => (
        <div className="field" key={field}>
          <label htmlFor={`contact-${field}`}>{field === "name" ? "Your name" : "Email address"}</label>
          <input
            id={`contact-${field}`}
            name={field}
            type={field === "email" ? "email" : "text"}
            value={form[field]}
            onChange={handleChange}
            aria-invalid={Boolean(errors[field])}
          />
          {errors[field] && <p className="field-error">{errors[field]}</p>}
        </div>
      ))}

      <div className="field">
        <label htmlFor="contact-message">Message</label>
        <textarea
          id="contact-message"
          name="message"
          rows="4"
          value={form.message}
          onChange={handleChange}
          aria-invalid={Boolean(errors.message)}
        />
        {errors.message && <p className="field-error">{errors.message}</p>}
      </div>

      {sent && (
        <div className="auth-success" role="status">
          <CheckCircle2 size={17} />
          Thanks for getting in touch. Our support team will reply soon.
        </div>
      )}

      <button type="submit" className="primary-button">
        Send message
      </button>
    </form>
  );
}

function Home() {
  const { user } = useAuth();
  const location = useLocation();

  const reportTo = user ? "/report-issue" : "/login";
  const trackTo = user ? "/my-complaints" : "/login";

  // Scroll to the section named in the URL hash (e.g. /#about).
  useEffect(() => {
    if (location.hash) {
      document
        .getElementById(location.hash.slice(1))
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [location.hash]);

  return (
    <div className="home-page">
      <Header />

      <main>
        <section className="hm-hero" id="home">
          <div className="container hm-hero-grid">
            <div className="hm-hero-copy">
              <h1>Report. Track. Improve Your City.</h1>

              <p>
                Report civic issues in your area and track their resolution
                through one simple platform.
              </p>

              <div className="hm-hero-buttons">
                <Link to={reportTo} className="primary-button">
                  Report an Issue
                  <ArrowRight size={18} />
                </Link>

                <Link to={trackTo} className="secondary-button">
                  Track Complaint
                </Link>
              </div>
            </div>

            <div className="hm-hero-visual">
              <HeroIllustration />

              <div className="hm-hero-card">
                <span className="hm-hero-card-title">Roadside pipe leakage</span>
                <span className="hm-hero-card-meta">
                  <MapPin size={14} /> Vijay Nagar
                </span>
                <span className="status status-in-progress">In Progress</span>
              </div>
            </div>
          </div>
        </section>

        <section className="hm-section hm-alt" id="categories">
          <div className="container">
            <div className="hm-heading">
              <h2>What can you report?</h2>
              <p>Choose the category that fits the problem you see.</p>
            </div>

            <div className="hm-category-grid">
              {CATEGORIES.map((category) => {
                const Icon = category.icon;

                return (
                  <Link
                    key={category.name}
                    to={user ? `/report-issue?category=${encodeURIComponent(category.name)}` : "/login"}
                    state={user ? undefined : { from: `/report-issue?category=${encodeURIComponent(category.name)}` }}
                    className="hm-category-card"
                  >
                    <span className="hm-icon">
                      <Icon size={22} />
                    </span>
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="hm-section" id="how-it-works">
          <div className="container">
            <div className="hm-heading">
              <h2>How CivicFix works</h2>
              <p>From your report to a fixed problem, in four clear steps.</p>
            </div>

            <ol className="hm-steps">
              {STEPS.map((step, index) => {
                const Icon = step.icon;

                return (
                  <li className="hm-step" key={step.title}>
                    <span className="hm-step-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="hm-icon">
                      <Icon size={22} />
                    </span>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section className="hm-section hm-alt" id="about">
          <div className="container hm-about">
            <div>
              <h2>About CivicFix</h2>
              <p>
                CivicFix is a civic issue reporting and complaint tracking
                platform. It gives citizens one place to tell their city about
                problems such as water leaks, potholes and broken street lights.
              </p>
            </div>

            <div className="hm-about-points">
              <div>
                <h3>Why it exists</h3>
                <p>
                  Many small problems go unreported because it is unclear where
                  to report them or whether anyone noticed.
                </p>
              </div>
              <div>
                <h3>How it helps</h3>
                <p>
                  Citizens report with a photo and location, then follow the
                  status. Administrators get a clear list to act on.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="hm-section" id="services">
          <div className="container">
            <div className="hm-heading">
              <h2>Our services</h2>
              <p>Everything you need to raise an issue and see it through.</p>
            </div>

            <div className="hm-service-grid">
              {SERVICES.map((service) => {
                const Icon = service.icon;

                return (
                  <div className="hm-service" key={service.title}>
                    <span className="hm-icon">
                      <Icon size={20} />
                    </span>
                    <div>
                      <h3>{service.title}</h3>
                      <p>{service.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="hm-section hm-alt" id="why">
          <div className="container">
            <div className="hm-heading">
              <h2>Why CivicFix</h2>
            </div>

            <div className="hm-reason-grid">
              {REASONS.map((reason) => {
                const Icon = reason.icon;

                return (
                  <div className="hm-reason" key={reason.title}>
                    <Icon size={22} />
                    <h3>{reason.title}</h3>
                    <p>{reason.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="hm-cta">
          <div className="container hm-cta-inner">
            <div>
              <h2>See a problem in your neighbourhood?</h2>
              <p>Report it now and help get it fixed.</p>
            </div>

            <Link to={reportTo} className="hm-cta-button">
              Report an Issue
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        <section className="hm-section" id="contact">
          <div className="container hm-contact">
            <div>
              <h2>Contact us</h2>
              <p>Questions about a complaint or the platform? We are here to help.</p>

              <ul className="hm-contact-list">
                <li>
                  <Mail size={18} />
                  <a href="mailto:support@civicfix.com">support@civicfix.com</a>
                </li>
                <li>
                  <Phone size={18} />
                  <a href="tel:+911800123456">1800 123 456 (toll free)</a>
                </li>
                <li>
                  <Clock3 size={18} />
                  <span>Support hours: Monday to Saturday, 9 am to 6 pm</span>
                </li>
              </ul>
            </div>

            <ContactForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
