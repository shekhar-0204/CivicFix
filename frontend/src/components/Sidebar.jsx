import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Settings,
  Tags,
  User,
} from "lucide-react";

import useAuth from "../hooks/useAuth";

const CITIZEN_ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", to: "/profile", icon: User },
  { label: "Report Issue", to: "/report-issue", icon: FileText },
  { label: "My Complaints", to: "/my-complaints", icon: ClipboardList },
];

const CITIZEN_FOOTER_ITEMS = [
  { label: "Settings", to: "/settings", icon: Settings },
  { label: "Help & Support", to: "/help", icon: LifeBuoy },
];

const ADMIN_ITEMS = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Complaints", to: "/admin/complaints", icon: ClipboardList },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
  { label: "Categories", to: "/admin/categories", icon: Tags },
  { label: "Profile", to: "/admin/profile", icon: User },
];

const ADMIN_FOOTER_ITEMS = [
  { label: "Settings", to: "/admin/settings", icon: Settings },
  { label: "Help & Support", to: "/admin/help", icon: LifeBuoy },
];

function Sidebar({ area = "citizen", open = false, onClose }) {
  const navigate = useNavigate();
  const { logout, adminLogout } = useAuth();

  const isAdmin = area === "admin";
  const mainItems = isAdmin ? ADMIN_ITEMS : CITIZEN_ITEMS;
  const footerItems = isAdmin ? ADMIN_FOOTER_ITEMS : CITIZEN_FOOTER_ITEMS;

  const handleLogout = () => {
    onClose?.();

    if (isAdmin) {
      adminLogout();
      navigate("/admin/login");
    } else {
      logout();
      navigate("/login");
    }
  };

  const renderItem = (item) => {
    const Icon = item.icon;

    return (
      <NavLink
        key={item.label}
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          isActive ? "sidebar-link active" : "sidebar-link"
        }
        onClick={onClose}
      >
        <Icon size={18} />
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <>
      <div
        className={open ? "sidebar-overlay visible" : "sidebar-overlay"}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={open ? "sidebar open" : "sidebar"}
        aria-label={isAdmin ? "Admin sidebar" : "Sidebar"}
      >
        <nav className="sidebar-nav">
          <div className="sidebar-group">{mainItems.map(renderItem)}</div>

          <div className="sidebar-group sidebar-group-bottom">
            {footerItems.map(renderItem)}

            <button type="button" className="sidebar-link sidebar-logout" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
