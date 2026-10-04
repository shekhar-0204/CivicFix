import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";

import Logo from "./Logo";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-about">
          <Logo />
          <p>
            CivicFix helps citizens report local problems and follow them
            until they are fixed.
          </p>
        </div>

        <div>
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/#about">About</Link></li>
            <li><Link to="/report-issue">Report an Issue</Link></li>
            <li><Link to="/my-complaints">Track Complaint</Link></li>
          </ul>
        </div>

        <div>
          <h4>Services</h4>
          <ul>
            <li><Link to="/#services">Issue Reporting</Link></li>
            <li><Link to="/#services">Complaint Tracking</Link></li>
            <li><Link to="/#categories">Issue Categories</Link></li>
            <li><Link to="/help">Help &amp; Support</Link></li>
          </ul>
        </div>

        <div>
          <h4>Contact</h4>
          <ul>
            <li>
              <a href="mailto:support@civicfix.com">
                <Mail size={15} />
                support@civicfix.com
              </a>
            </li>
            <li>
              <a href="tel:+911800123456">
                <Phone size={15} />
                1800 123 456
              </a>
            </li>
            <li><Link to="/admin/login">Admin Login</Link></li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© 2026 CivicFix. All rights reserved.</span>
      </div>
    </footer>
  );
}

export default Footer;
