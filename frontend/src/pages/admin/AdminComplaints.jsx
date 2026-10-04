import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, MapPin, Search } from "lucide-react";

import AppLayout from "../../components/AppLayout";
import ComplaintImage from "../../components/ComplaintImage";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import StatusBadge from "../../components/StatusBadge";
import { CATEGORY_NAMES } from "../../data/categories";
import useAsync from "../../hooks/useAsync";
import { getAllAdminComplaints } from "../../services/complaintService";
import { formatDate, STATUSES, truncate } from "../../utils/helpers";

const STATUS_FILTERS = ["All", ...STATUSES];

function AdminComplaints() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category");

  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState(
    CATEGORY_NAMES.includes(initialCategory) ? initialCategory : "All"
  );
  const [searchTerm, setSearchTerm] = useState("");

  const { data: complaints, loading, error, reload } = useAsync(getAllAdminComplaints);

  const search = searchTerm.trim().toLowerCase();

  const filtered = (complaints || []).filter((complaint) => {
    const matchesStatus = statusFilter === "All" || complaint.status === statusFilter;
    const matchesCategory = categoryFilter === "All" || complaint.category === categoryFilter;
    const matchesSearch =
      !search ||
      [complaint.id, complaint.title, complaint.category, complaint.location, complaint.description]
        .join(" ")
        .toLowerCase()
        .includes(search);

    return matchesStatus && matchesCategory && matchesSearch;
  });

  const clearFilters = () => {
    setStatusFilter("All");
    setCategoryFilter("All");
    setSearchTerm("");
  };

  return (
    <AppLayout
      area="admin"
      title="Complaints"
      description="View and manage complaints submitted by citizens."
    >
      {loading && <Loader label="Loading complaints…" />}

      {error && (
        <EmptyState
          type="error"
          title="Something went wrong. Please try again." message={error.message}
          action={<button type="button" className="secondary-button" onClick={reload}>Try again</button>}
        />
      )}

      {complaints && (
        <>
          <div className="toolbar">
            <div className="filter-row" role="group" aria-label="Filter by status">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={statusFilter === filter ? "filter-chip active" : "filter-chip"}
                  aria-pressed={statusFilter === filter}
                  onClick={() => setStatusFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="toolbar-fields">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by category"
              >
                <option value="All">All categories</option>
                {CATEGORY_NAMES.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>

              <div className="search-box">
                <Search size={17} />
                <input
                  type="search"
                  placeholder="Search complaints…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search complaints"
                />
              </div>
            </div>
          </div>

          <section className="panel">
            <div className="panel-head">
              <p className="muted">
                Showing {filtered.length} of {complaints.length} complaint
                {complaints.length !== 1 ? "s" : ""}
              </p>
            </div>

            {filtered.length > 0 ? (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Issue</th>
                      <th>Category</th>
                      <th>Locality</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th><span className="sr-only">Action</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((complaint) => (
                      <tr key={complaint.id}>
                        <td>
                          <Link to={`/admin/complaints/${complaint.id}`} className="table-id">
                            {complaint.id}
                          </Link>
                        </td>
                        <td>
                          <div className="table-issue">
                            <ComplaintImage src={complaint.photo} alt="" className="table-thumb" />
                            <div>
                              <strong>{complaint.title}</strong>
                              <p>{truncate(complaint.description, 70)}</p>
                            </div>
                          </div>
                        </td>
                        <td>{complaint.category}</td>
                        <td>
                          <span className="with-icon">
                            <MapPin size={14} />
                            {complaint.location}
                          </span>
                        </td>
                        <td className="nowrap">{formatDate(complaint.date)}</td>
                        <td>
                          <StatusBadge status={complaint.status} />
                        </td>
                        <td>
                          <Link to={`/admin/complaints/${complaint.id}`} className="text-link">
                            View
                            <ArrowRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No complaints found."
                message="Try a different search or clear the filters."
                action={<button type="button" className="secondary-button" onClick={clearFilters}>Clear filters</button>}
              />
            )}
          </section>
        </>
      )}
    </AppLayout>
  );
}

export default AdminComplaints;
