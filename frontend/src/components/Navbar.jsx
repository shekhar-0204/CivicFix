import { Link, useLocation } from "react-router-dom";

import useAuth from "../hooks/useAuth";

// Public navigation. Sections live on the Home page; Profile is its own page.
function Navbar({ className = "", onNavigate }) {
  const { user, admin } = useAuth();
  const location = useLocation();

  const profilePath = admin ? "/admin/profile" : user ? "/profile" : "/login";

  const items = [
    { label: "Home", to: "/" },
    { label: "About", to: "/#about" },
    { label: "Services", to: "/#services" },
    { label: "Categories", to: "/#categories" },
    { label: "Contact", to: "/#contact" },
    { label: "Profile", to: profilePath },
  ];

  const isActive = (to) => {
    const [path, hash] = to.split("#");

    if (path === "/") {
      return location.pathname === "/" && location.hash === (hash ? `#${hash}` : "");
    }

    return location.pathname === path;
  };

  const handleClick = (to) => {
    if (to === "/" && location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    onNavigate?.();
  };

  return (
    <nav className={`site-nav ${className}`} aria-label="Main navigation">
      {items.map((item) => (
        <Link
          key={item.label}
          to={item.to}
          className={isActive(item.to) ? "site-nav-link active" : "site-nav-link"}
          aria-current={isActive(item.to) ? "page" : undefined}
          onClick={() => handleClick(item.to)}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export default Navbar;
