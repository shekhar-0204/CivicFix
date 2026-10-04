import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, Clock3, FileText, MapPin } from "lucide-react";

import AppLayout from "../../components/AppLayout";
import ComplaintImage from "../../components/ComplaintImage";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import StatsCard from "../../components/StatsCard";
import StatusBadge from "../../components/StatusBadge";
import useAsync from "../../hooks/useAsync";
import { getAdminDashboard } from "../../services/complaintService";

function AdminDashboard() {
  const { data, loading, error, reload } = useAsync(getAdminDashboard);

  return (
    <AppLayout
      area="admin"
      title="Dashboard"
      description="Monitor and manage civic complaints submitted by citizens."
      actions={
        <Link to="/admin/complaints" className="primary-button">
          View All Complaints
          <ArrowRight size={17} />
        </Link>
      }
    >
      {loading && <Loader label="Loading dashboard…" />}

      {error && (
        <EmptyState
          type="error"
          title="Something went wrong. Please try again." message={error.message}
          action={<button type="button" className="secondary-button" onClick={reload}>Try again</button>}
        />
      )}

      {data && (
        <>
          <section className="stats-grid" aria-label="Complaint summary">
            <StatsCard label="Total complaints" value={data.stats.total} icon={FileText} tone="neutral" />
            <StatsCard label="Submitted" value={data.stats.submitted} icon={AlertCircle} tone="warning" />
            <StatsCard label="In Progress" value={data.stats.inProgress} icon={Clock3} tone="primary" />
            <StatsCard label="Resolved" value={data.stats.resolved} icon={CheckCircle2} tone="success" />
          </section>

          <div className="admin-overview">
            <section className="panel">
              <div className="panel-head">
                <h2>Recent complaints</h2>
                <Link to="/admin/complaints" className="text-link">
                  View all
                  <ArrowRight size={16} />
                </Link>
              </div>

              {data.recent.length > 0 ? (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Issue</th>
                        <th>Category</th>
                        <th>Locality</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent.map((complaint) => (
                        <tr key={complaint.id}>
                          <td>
                            <Link to={`/admin/complaints/${complaint.id}`} className="table-id">
                              {complaint.id}
                            </Link>
                          </td>
                          <td>
                            <div className="table-issue">
                              <ComplaintImage src={complaint.photo} alt="" className="table-thumb" />
                              <span>{complaint.title}</span>
                            </div>
                          </td>
                          <td>{complaint.category}</td>
                          <td>
                            <span className="with-icon">
                              <MapPin size={14} />
                              {complaint.location}
                            </span>
                          </td>
                          <td>
                            <StatusBadge status={complaint.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="No complaints found." />
              )}
            </section>

            <section className="panel">
              <div className="panel-head">
                <h2>By category</h2>
                <Link to="/admin/reports" className="text-link">
                  Reports
                  <ArrowRight size={16} />
                </Link>
              </div>

              <ul className="bar-list">
                {data.categories.map((category) => (
                  <li key={category.name}>
                    <div className="bar-label">
                      <span>{category.name}</span>
                      <strong>{category.total}</strong>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${data.stats.total ? (category.total / data.stats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </AppLayout>
  );
}

export default AdminDashboard;
