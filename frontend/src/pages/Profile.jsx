import { Link, useNavigate } from "react-router-dom";
import { Edit3, KeyRound, LogOut, Mail, MapPin, Phone, User } from "lucide-react";

import AppLayout from "../components/AppLayout";
import Loader from "../components/Loader";
import useAsync from "../hooks/useAsync";
import useAuth from "../hooks/useAuth";
import { getComplaintStats } from "../services/complaintService";
import { getInitials } from "../utils/helpers";

function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: stats, loading, error: statsError } = useAsync(getComplaintStats);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const details = [
    { label: "Full name", value: user.name, icon: User },
    { label: "Email address", value: user.email, icon: Mail },
    { label: "Phone number", value: user.phone, icon: Phone },
    { label: "Location", value: user.location || "Not added yet", icon: MapPin },
  ];

  return (
    <AppLayout title="My profile" description="Manage your CivicFix account information.">
      <div className="profile-layout">
        <section className="panel">
          <div className="profile-top">
            <div className="profile-avatar">{getInitials(user.name)}</div>
            <div>
              <h2>{user.name}</h2>
              <p className="muted">CivicFix Citizen</p>
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
            <Link to="/settings" className="primary-button">
              <Edit3 size={17} />
              Edit Profile
            </Link>
            <Link to="/settings#password" className="secondary-button">
              <KeyRound size={17} />
              Change Password
            </Link>
          </div>
        </section>

        <aside className="profile-side">
          <section className="panel">
            <div className="panel-head">
              <h2>Complaint summary</h2>
            </div>

            {loading || (!stats && !statsError) ? (
              <Loader />
            ) : statsError ? (
              <p className="muted" role="alert">{statsError.message}</p>
            ) : (
              <div className="mini-stats">
                <div>
                  <strong>{stats.total}</strong>
                  <span>Total</span>
                </div>
                <div>
                  <strong>{stats.resolved}</strong>
                  <span>Resolved</span>
                </div>
                <div>
                  <strong>{stats.inProgress}</strong>
                  <span>In Progress</span>
                </div>
              </div>
            )}
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>Account</h2>
            </div>

            <button type="button" className="danger-button block-button" onClick={handleLogout}>
              <LogOut size={17} />
              Logout
            </button>
          </section>
        </aside>
      </div>
    </AppLayout>
  );
}

export default Profile;
