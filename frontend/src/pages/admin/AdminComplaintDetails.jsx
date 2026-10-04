import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock3, MapPin, Send } from "lucide-react";

import AppLayout from "../../components/AppLayout";
import ComplaintImage from "../../components/ComplaintImage";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import StatusBadge from "../../components/StatusBadge";
import useAsync from "../../hooks/useAsync";
import { getAdminComplaintById, updateComplaintStatus } from "../../services/complaintService";
import { formatDate, formatDateTime, getNextStatus } from "../../utils/helpers";

const ICONS = { Submitted: Send, "In Progress": Clock3, Resolved: CheckCircle2 };

function AdminComplaintDetails() {
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [updating, setUpdating] = useState(false);
  // The complaint object returned by the PATCH request (rendered as-is).
  const [updated, setUpdated] = useState(null);

  const { data: fetched, loading, error, reload } = useAsync(() => getAdminComplaintById(id), [id]);

  const complaint = updated && updated.id === fetched?.id ? updated : fetched;

  const backAction = (
    <Link to="/admin/complaints" className="secondary-button">
      <ArrowLeft size={16} />
      Back to Complaints
    </Link>
  );

  if (loading) {
    return (
      <AppLayout area="admin" title="Complaint details">
        <Loader label="Loading complaint…" />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout area="admin" title="Complaint details" actions={backAction}>
        <EmptyState type="error" title="Something went wrong. Please try again." message={error.message} />
      </AppLayout>
    );
  }

  if (!complaint) {
    return (
      <AppLayout area="admin" title="Complaint details" actions={backAction}>
        <EmptyState
          type="notfound"
          title="Complaint not found."
          message={`There is no complaint with ID ${id}.`}
        />
      </AppLayout>
    );
  }

  const next = getNextStatus(complaint);

  const handleUpdate = async () => {
    setMessage("");
    setUpdateError("");
    setUpdating(true);

    try {
      // The backend checks the transition and returns the updated complaint.
      const result = await updateComplaintStatus(complaint.id, next);
      setUpdated(result);
      setMessage(`Status updated to ${result.status}.`);
    } catch (err) {
      setUpdateError(err.message);

      // 409: someone else changed it first. Reload so the page shows the real status.
      if (err.status === 409) {
        setUpdated(null);
        reload();
      }
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AppLayout
      area="admin"
      title={complaint.title}
      description={`Complaint ID ${complaint.id}`}
      actions={
        <>
          <StatusBadge status={complaint.status} />
          {backAction}
        </>
      }
    >
      <div className="details-layout">
        <div className="details-main-col">
          <section className="panel">
            <div className="panel-head">
              <h2>Complaint information</h2>
            </div>

            <dl className="info-grid">
              <div>
                <dt>Issue</dt>
                <dd>{complaint.title}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{complaint.category}</dd>
              </div>
              <div>
                <dt>Date submitted</dt>
                <dd>{formatDate(complaint.date)}</dd>
              </div>
              <div>
                <dt>Locality</dt>
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
              <h2>Status timeline</h2>
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
            </ol>
          </section>
        </div>

        <aside className="details-side-col">
          <section className="panel">
            <div className="panel-head">
              <h2>Update status</h2>
            </div>

            {next ? (
              <>
                <p className="muted">
                  Move this complaint from <strong>{complaint.status}</strong> to <strong>{next}</strong>.
                  Status cannot be moved back.
                </p>
                <button
                  type="button"
                  className="primary-button block-button"
                  onClick={handleUpdate}
                  disabled={updating}
                >
                  {updating ? "Updating…" : `Mark as ${next}`}
                </button>
              </>
            ) : (
              <div className="auth-success">
                <CheckCircle2 size={17} />
                This complaint is resolved.
              </div>
            )}

            {message && (
              <div className="auth-success" role="status">
                <CheckCircle2 size={17} />
                {message}
              </div>
            )}
            {updateError && <div className="auth-error" role="alert">{updateError}</div>}
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>Photo</h2>
            </div>
            <ComplaintImage src={complaint.photo} alt={complaint.title} className="details-photo" />
            {!complaint.photo && <p className="muted">No photo was uploaded with this complaint.</p>}
          </section>
        </aside>
      </div>
    </AppLayout>
  );
}

export default AdminComplaintDetails;
