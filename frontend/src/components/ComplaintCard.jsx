import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";

import ComplaintImage from "./ComplaintImage";
import StatusBadge from "./StatusBadge";
import { formatDate } from "../utils/helpers";

function ComplaintCard({ complaint, to }) {
  return (
    <article className="complaint-card">
      <ComplaintImage
        src={complaint.photo}
        alt={complaint.title}
        className="complaint-card-photo"
      />

      <div className="complaint-card-body">
        <div className="complaint-card-top">
          <h3>{complaint.title}</h3>
          <StatusBadge status={complaint.status} />
        </div>

        <p className="complaint-card-meta">
          <span>#{complaint.id}</span>
          <span>{complaint.category}</span>
        </p>

        <p className="complaint-card-meta">
          <span>
            <MapPin size={14} />
            {complaint.location}
          </span>
          <span>
            <CalendarDays size={14} />
            {formatDate(complaint.date)}
          </span>
        </p>
      </div>

      <Link
        to={to || `/complaints/${complaint.id}`}
        className="complaint-card-link"
        aria-label={`View details of complaint ${complaint.id}`}
      >
        View Details
        <ArrowRight size={16} />
      </Link>
    </article>
  );
}

export default ComplaintCard;
