import { Link } from "react-router-dom";

import AppLayout from "../../components/AppLayout";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import useAsync from "../../hooks/useAsync";
import { getAdminDashboard } from "../../services/complaintService";

function percent(part, total) {
  return total ? Math.round((part / total) * 100) : 0;
}

function AdminReports() {
  const { data, loading, error, reload } = useAsync(getAdminDashboard);

  const rows = [
    { label: "Submitted", key: "submitted", tone: "warning" },
    { label: "In Progress", key: "inProgress", tone: "primary" },
    { label: "Resolved", key: "resolved", tone: "success" },
  ];

  return (
    <AppLayout
      area="admin"
      title="Reports"
      description="An overview of complaint progress across the city."
    >
      {loading && <Loader label="Loading reports…" />}

      {error && (
        <EmptyState
          type="error"
          title="Something went wrong. Please try again." message={error.message}
          action={<button type="button" className="secondary-button" onClick={reload}>Try again</button>}
        />
      )}

      {data && (
        <div className="reports-layout">
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2>Resolution rate</h2>
                <p>{data.stats.resolved} of {data.stats.total} complaints resolved</p>
              </div>
              <strong className="big-number">{percent(data.stats.resolved, data.stats.total)}%</strong>
            </div>

            <ul className="bar-list">
              {rows.map((row) => (
                <li key={row.key}>
                  <div className="bar-label">
                    <span>{row.label}</span>
                    <strong>{data.stats[row.key]}</strong>
                  </div>
                  <div className="bar-track">
                    <div
                      className={`bar-fill bar-${row.tone}`}
                      style={{ width: `${percent(data.stats[row.key], data.stats.total)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>Complaints by category</h2>
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total</th>
                    <th>Submitted</th>
                    <th>In Progress</th>
                    <th>Resolved</th>
                  </tr>
                </thead>
                <tbody>
                  {data.categories.map((category) => (
                    <tr key={category.name}>
                      <td>
                        <Link to={`/admin/complaints?category=${encodeURIComponent(category.name)}`} className="table-id">
                          {category.name}
                        </Link>
                      </td>
                      <td>{category.total}</td>
                      <td>{category.submitted}</td>
                      <td>{category.inProgress}</td>
                      <td>{category.resolved}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </AppLayout>
  );
}

export default AdminReports;
