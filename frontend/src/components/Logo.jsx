import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

function Logo({ to = "/", label = "CivicFix", onClick }) {
  return (
    <Link to={to} className="logo" onClick={onClick} aria-label={`${label} home`}>
      <span className="logo-icon">
        <MapPin size={20} />
      </span>
      <span>{label}</span>
    </Link>
  );
}

export default Logo;
