import { Link, useLocation, useParams } from "react-router-dom";
import { CheckCircle2, Clock3, MapPin, Send } from "lucide-react";

import AppLayout from "../components/AppLayout";
import ComplaintImage from "../components/ComplaintImage";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import useAsync from "../hooks/useAsync";
import { getMyComplaintById } from "../services/complaintService";
import { formatDate, formatDateTime, getNextStatus, NEXT_STATUS } from "../utils/helpers";

const ICONS = {
  Submitted: Send,
  "In Progress": Clock3,
  Resolved: CheckCircle2,
};

const PENDING_COPY = {
  "In Progress": {
    title: "Work in Progress",
    description: "Work will begin once the complaint is assigned.",
  },
  Resolved: {
    title: "Issue Resolved",
    description: "The issue will be marked resolved after completion.",
  },
};

// Steps that have not happened yet (display only; the timeline itself comes from the API).
const getPendingSteps = (complaint) => {
  const steps = [];
  let next = getNextStatus(complaint);

  while (next) {
    steps.push({ status: next, ...PENDING_COPY[next] });
    next = NEXT_STATUS[next];
  }

  return steps;
};

function ComplaintDetails() {
  const { id } = useParams();
  const location = useLocation();

  const { data: complaint, loading, error } = useAsync(() => getMyComplaintById(id), [id]);

  if (loading) {
    return (
      <AppLayout title="Complaint details">
        <Loader label="Loading complaint…" />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Complaint details">
        <EmptyState type="error" title="Something went wrong. Please try again." message={error.message} />
      </AppLayout>
    );
  }

  if (!complaint) {
    return (
      <AppLayout title="Complaint details">
        <EmptyState
          type="notfound"
          title="Complaint not found."
          message={`We could not find a complaint with ID ${id} on your account.`}
          action={<Link to="/my-complaints" className="primary-button">Back to My Complaints</Link>}
        />
      </AppLayout>
    );
  }

  const pending = getPendingSteps(complaint);

  return (
    <AppLayout
      title={complaint.title}
      description={`Complaint ID #${complaint.id}`}
      actions={<StatusBadge status={complaint.status} />}
    >
      {location.state?.created && (
        <div className="auth-success" role="status">
          <CheckCircle2 size={17} />
          Complaint submitted. You can track its progress on this page.
        </div>
      )}

      <div className="details-layout">
        <div className="details-main-col">
          <section className="panel">
            <div className="panel-head">
              <h2>Complaint information</h2>
            </div>

            <dl className="info-grid">
              <div>
                <dt>Category</dt>
                <dd>{complaint.category}</dd>
              </div>
              <div>
                <dt>Submitted on</dt>
                <dd>{formatDate(complaint.date)}</dd>
              </div>
              <div className="info-wide">
                <dt>Location</dt>
                <dd className="with-icon">
                  <MapPin size={16} />
                  {complaint.location}
                </dd>
              </div>
              <div className="info-wide">
                <dt>Description</dt>
                <dd>{complaint.description}</dd>
              </div>
            </dl>
          </section>

          <section className="panel">
            <div className="panel-head">
              <div>
                <h2>Complaint status</h2>
                <p>Track the progress of your complaint.</p>
              </div>
            </div>

            <ol className="timeline">
              {complaint.timeline.map((item, index) => {
                const Icon = ICONS[item.status] || Send;

                return (
                  <li className="timeline-step done" key={`${item.title}-${index}`}>
                    <span className="timeline-dot">
                      <Icon size={16} />
                    </span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                      <small>{formatDateTime(item.date)}</small>
                    </div>
                  </li>
                );
              })}

              {pending.map((step) => {
                const Icon = ICONS[step.status];

                return (
                  <li className="timeline-step" key={step.status}>
                    <span className="timeline-dot">
                      <Icon size={16} />
                    </span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                      <small>Pending</small>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        <aside className="details-side-col">
          <section className="panel">
            <div className="panel-head">
              <h2>Issue photo</h2>
            </div>
            <ComplaintImage src={complaint.photo} alt={complaint.title} className="details-photo" />
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>Need help?</h2>
            </div>
            <p className="muted">
              If the information about your complaint is incorrect, contact the civic support team.
            </p>
            <Link to="/help" className="secondary-button block-button">
              Contact Support
            </Link>
          </section>
        </aside>
      </div>
    </AppLayout>
  );
}

export default ComplaintDetails;
