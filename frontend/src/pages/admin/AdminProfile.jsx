import { Link, useNavigate } from "react-router-dom";
import { Edit3, KeyRound, LogOut, Mail, ShieldCheck, User } from "lucide-react";

import AppLayout from "../../components/AppLayout";
import useAuth from "../../hooks/useAuth";
import { getInitials } from "../../utils/helpers";

function AdminProfile() {
  const navigate = useNavigate();
  const { admin, adminLogout } = useAuth();

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/login");
  };

  const details = [
    { label: "Name", value: admin.name, icon: User },
    { label: "Email", value: admin.email, icon: Mail },
    { label: "Role", value: admin.role, icon: ShieldCheck },
  ];

  return (
    <AppLayout
      area="admin"
      title="Admin profile"
      description="Your administrator account information."
    >
      <section className="panel profile-single">
        <div className="profile-top">
          <div className="profile-avatar">{getInitials(admin.name)}</div>
          <div>
            <h2>{admin.name}</h2>
            <p className="muted">{admin.role}</p>
          </div>
        </div>

        <ul className="detail-list">
          {details.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.label}>
                <span className="detail-icon">
                  <Icon size={18} />
                </span>
                <div>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="button-row">
          <Link to="/admin/settings" className="primary-button">
            <Edit3 size={17} />
            Edit Profile
          </Link>
          <Link to="/admin/settings#password" className="secondary-button">
            <KeyRound size={17} />
            Change Password
          </Link>
          <button type="button" className="danger-button" onClick={handleLogout}>
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </section>
    </AppLayout>
  );
}

export default AdminProfile;
