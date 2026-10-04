import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CheckCircle2, Lock, MapPin, Phone, User } from "lucide-react";

import AppLayout from "../components/AppLayout";
import FormField from "../components/FormField";
import useAuth from "../hooks/useAuth";
import { isValidPhone } from "../utils/helpers";

// Account settings for both citizens (area="citizen") and admins (area="admin").
function Settings({ area = "citizen" }) {
  const isAdmin = area === "admin";
  const location = useLocation();
  const auth = useAuth();

  const person = isAdmin ? auth.admin : auth.user;

  const [profile, setProfile] = useState({
    name: person.name || "",
    phone: person.phone || "",
    location: person.location || "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileMessage, setProfileMessage] = useState("");

  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    if (location.hash === "#password") {
      document.getElementById("password")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.hash]);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileMessage("");

    const errors = {};
    if (!profile.name.trim()) errors.name = "Name is required.";
    if (!isAdmin && !profile.phone.trim()) errors.phone = "Phone number is required.";
    else if (!isAdmin && !isValidPhone(profile.phone)) errors.phone = "Enter a valid phone number.";

    setProfileErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      if (isAdmin) {
        await auth.updateAdmin({ name: profile.name });
      } else {
        await auth.updateProfile({
          name: profile.name.trim(),
          phone: profile.phone.trim(),
          location: profile.location.trim(),
        });
      }
      setProfileMessage("Profile updated.");
    } catch (error) {
      setProfileErrors({ ...(error.fieldErrors || {}), form: error.fieldErrors ? "" : error.message });
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordMessage("");

    const errors = {};
    if (!passwords.current) errors.current = "Enter your current password.";
    if (!passwords.next) errors.next = "Enter a new password.";
    else if (passwords.next.length < 6) errors.next = "Use at least 6 characters.";
    if (passwords.confirm !== passwords.next) errors.confirm = "Passwords do not match.";

    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await (isAdmin ? auth.changeAdminPassword : auth.changePassword)(passwords.current, passwords.next);
      setPasswords({ current: "", next: "", confirm: "" });
      setPasswordMessage("Password changed.");
    } catch (error) {
      setPasswordErrors({
        current: error.fieldErrors?.currentPassword || error.message,
        next: error.fieldErrors?.newPassword,
      });
    }
  };

  return (
    <AppLayout
      area={area}
      title="Settings"
      description="Update your profile details and password."
    >
      <div className="settings-layout">
        <section className="panel">
          <div className="panel-head">
            <h2>Profile</h2>
          </div>

          <form onSubmit={handleProfileSubmit} className="stack-form" noValidate>
            <FormField
              id="settings-name"
              label="Full name"
              icon={User}
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              error={profileErrors.name}
            />

            <FormField
              id="settings-email"
              label="Email address"
              value={person.email}
              readOnly
              disabled
            />

            {!isAdmin && (
              <>
                <FormField
                  id="settings-phone"
                  label="Phone number"
                  icon={Phone}
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  error={profileErrors.phone}
                />

                <FormField
                  id="settings-location"
                  label="Location"
                  icon={MapPin}
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                />
              </>
            )}

            {profileErrors.form && <div className="auth-error" role="alert">{profileErrors.form}</div>}
            {profileMessage && (
              <div className="auth-success" role="status">
                <CheckCircle2 size={17} />
                {profileMessage}
              </div>
            )}

            <button type="submit" className="primary-button">Save changes</button>
          </form>
        </section>

        <section className="panel" id="password">
          <div className="panel-head">
            <h2>Change password</h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="stack-form" noValidate>
            <FormField
              id="current-password"
              label="Current password"
              icon={Lock}
              type="password"
              autoComplete="current-password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              error={passwordErrors.current}
            />

            <FormField
              id="new-password"
              label="New password"
              icon={Lock}
              type="password"
              autoComplete="new-password"
              value={passwords.next}
              onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
              error={passwordErrors.next}
            />

            <FormField
              id="confirm-new-password"
              label="Confirm new password"
              icon={Lock}
              type="password"
              autoComplete="new-password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              error={passwordErrors.confirm}
            />

            {passwordMessage && (
              <div className="auth-success" role="status">
                <CheckCircle2 size={17} />
                {passwordMessage}
              </div>
            )}

            <button type="submit" className="primary-button">Change password</button>
          </form>
        </section>
      </div>
    </AppLayout>
  );
}

export default Settings;
