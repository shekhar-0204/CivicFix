import { Link } from "react-router-dom";
import { Clock3, Mail, Phone } from "lucide-react";

import AppLayout from "../components/AppLayout";

const CITIZEN_FAQS = [
  {
    q: "How do I report an issue?",
    a: "Open Report Issue, choose a category, describe the problem, add the location and an optional photo, then submit.",
  },
  {
    q: "What do the complaint statuses mean?",
    a: "Submitted means we received it. In Progress means work has been assigned. Resolved means the issue has been fixed.",
  },
  {
    q: "Can I edit a complaint after submitting it?",
    a: "Not yet. If something is wrong, contact support with your complaint ID and we will help.",
  },
  {
    q: "Where can I see my complaints?",
    a: "Go to My Complaints to see every report, filter by status and open the full timeline.",
  },
];

const ADMIN_FAQS = [
  {
    q: "How do I update a complaint's status?",
    a: "Open the complaint from the Complaints list and use the update button. Status only moves forward: Submitted, In Progress, then Resolved.",
  },
  {
    q: "Can I move a complaint back to an earlier status?",
    a: "No. Status changes are one-way so citizens always see an accurate history.",
  },
  {
    q: "How do I find a specific complaint?",
    a: "On the Complaints page, search by ID, issue, category or location, and filter by status or category.",
  },
];

function Help({ area = "citizen" }) {
  const isAdmin = area === "admin";
  const faqs = isAdmin ? ADMIN_FAQS : CITIZEN_FAQS;

  return (
    <AppLayout
      area={area}
      title="Help & support"
      description="Answers to common questions and ways to reach us."
    >
      <div className="help-layout">
        <section className="panel">
          <div className="panel-head">
            <h2>Frequently asked questions</h2>
          </div>

          <div className="faq-list">
            {faqs.map((faq) => (
              <details key={faq.q} className="faq-item">
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head">
            <h2>Contact support</h2>
          </div>

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
              <span>Monday to Saturday, 9 am to 6 pm</span>
            </li>
          </ul>

          {!isAdmin && (
            <Link to="/my-complaints" className="secondary-button block-button">
              Go to My Complaints
            </Link>
          )}
        </aside>
      </div>
    </AppLayout>
  );
}

export default Help;
