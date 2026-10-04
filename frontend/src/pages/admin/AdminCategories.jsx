import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import AppLayout from "../../components/AppLayout";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import { CATEGORIES } from "../../data/categories";
import useAsync from "../../hooks/useAsync";
import { getAdminDashboard } from "../../services/complaintService";

function AdminCategories() {
  const { data, loading, error, reload } = useAsync(getAdminDashboard);

  // Per-category counts come from GET /admin/dashboard.
  const statsFor = (name) =>
    data?.categories.find((item) => item.name === name) || {
      total: 0,
      submitted: 0,
      inProgress: 0,
      resolved: 0,
    };

  return (
    <AppLayout
      area="admin"
      title="Categories"
      description="Civic issue categories citizens can report, with current complaint counts."
    >
      {loading && <Loader label="Loading categories…" />}

      {error && (
        <EmptyState
          type="error"
          title="Something went wrong. Please try again." message={error.message}
          action={<button type="button" className="secondary-button" onClick={reload}>Try again</button>}
        />
      )}

      {data && (
        <div className="admin-category-grid">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const stats = statsFor(category.name);

            return (
              <article className="panel admin-category" key={category.name}>
                <span className="hm-icon">
                  <Icon size={22} />
                </span>
                <h3>{category.name}</h3>
                <p className="muted">{category.description}</p>

                <div className="admin-category-counts">
                  <span><strong>{stats.total}</strong> total</span>
                  <span><strong>{stats.submitted + stats.inProgress}</strong> open</span>
                </div>

                <Link
                  to={`/admin/complaints?category=${encodeURIComponent(category.name)}`}
                  className="text-link"
                >
                  View complaints
                  <ArrowRight size={16} />
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}

export default AdminCategories;
