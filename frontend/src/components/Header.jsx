import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";

import Logo from "./Logo";
import Navbar from "./Navbar";
import useAuth from "../hooks/useAuth";
import { getInitials } from "../utils/helpers";

// variant="public": marketing header with the main navigation (Home page).
// variant="app":    slim top bar used above the sidebar (citizen and admin).
function Header({ variant = "public", area = "citizen", onMenuClick, menuOpen = false }) {
  const navigate = useNavigate();
  const { user, admin, logout, adminLogout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdminArea = area === "admin";
  const person = variant === "app" ? (isAdminArea ? admin : user) : admin || user;
  const isAdmin = variant === "app" ? isAdminArea : Boolean(admin);
  const profilePath = isAdmin ? "/admin/profile" : "/profile";
  const homePath = isAdmin ? "/admin" : "/dashboard";

  const handleLogout = () => {
    if (isAdmin) {
      adminLogout();
      navigate("/admin/login");
    } else {
      logout();
      navigate("/login");
    }
  };

  const closeMobile = () => setMobileOpen(false);

  const profileChip = person && (
    <Link
      to={profilePath}
      className="user-chip"
      onClick={closeMobile}
      aria-label={isAdmin ? "Admin profile" : "Profile"}
    >
      <span className="user-avatar">{getInitials(person.name)}</span>
      <span className="user-name">{person.name}</span>
    </Link>
  );

  const logoutButton = (
    <button type="button" className="header-logout" onClick={handleLogout}>
      <LogOut size={16} />
      <span>Logout</span>
    </button>
  );

  // ---------- App bar ----------
  if (variant === "app") {
    return (
      <header className="app-topbar">
        <div className="app-topbar-inner">
          <button
            type="button"
            className="icon-button menu-toggle"
            onClick={onMenuClick}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Logo to={homePath} label={isAdmin ? "CivicFix Admin" : "CivicFix"} />

          <div className="app-topbar-actions">
            {profileChip}
            {logoutButton}
          </div>
        </div>
      </header>
    );
  }

  // ---------- Public header ----------
  const actions = person ? (
    <>
      <Link
        to={isAdmin ? "/admin" : "/dashboard"}
        className="header-link"
        onClick={closeMobile}
      >
        {isAdmin ? "Admin Panel" : "Dashboard"}
      </Link>
      {profileChip}
      {logoutButton}
    </>
  ) : (
    <>
      <Link to="/login" className="header-link" onClick={closeMobile}>
        Login
      </Link>
      <Link to="/register" className="header-register" onClick={closeMobile}>
        Register
      </Link>
    </>
  );

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Logo />

        <Navbar className="site-nav-desktop" />

        <div className="site-header-actions">{actions}</div>

        <button
          type="button"
          className="icon-button site-menu-toggle"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="site-mobile-panel">
          <Navbar onNavigate={closeMobile} />
          <div className="site-mobile-actions">{actions}</div>
        </div>
      )}
    </header>
  );
}

export default Header;
