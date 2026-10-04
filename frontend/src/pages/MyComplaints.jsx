import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

import AppLayout from "../components/AppLayout";
import ComplaintCard from "../components/ComplaintCard";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import useAsync from "../hooks/useAsync";
import { getMyComplaints } from "../services/complaintService";

const FILTERS = ["All", "Submitted", "In Progress", "Resolved"];

function MyComplaints() {
  const [activeFilter, setActiveFilter] = useState("All");
  const { data: complaints, loading, error, reload } = useAsync(getMyComplaints);

  const all = complaints || [];
  const visible =
    activeFilter === "All" ? all : all.filter((complaint) => complaint.status === activeFilter);

  const countFor = (filter) =>
    filter === "All" ? all.length : all.filter((c) => c.status === filter).length;

  return (
    <AppLayout
      title="My complaints"
      description="View and track all the civic issues you have reported."
      actions={
        <Link to="/report-issue" className="primary-button">
          <Plus size={18} />
          Report New Issue
        </Link>
      }
    >
      {loading && <Loader label="Loading your complaints…" />}

      {error && (
        <EmptyState
          type="error"
          title="Something went wrong. Please try again." message={error.message}
          action={<button type="button" className="secondary-button" onClick={reload}>Try again</button>}
        />
      )}

      {complaints && (
        <>
          <div className="filter-row" role="group" aria-label="Filter by status">
            {FILTERS.map((filter) => (
              <button
                type="button"
                key={filter}
                className={activeFilter === filter ? "filter-chip active" : "filter-chip"}
                aria-pressed={activeFilter === filter}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
                <span>{countFor(filter)}</span>
              </button>
            ))}
          </div>

          {visible.length > 0 ? (
            <div className="complaint-stack">
              {visible.map((complaint) => (
                <ComplaintCard key={complaint.id} complaint={complaint} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No complaints found."
              message={
                all.length === 0
                  ? "You have not reported any issues yet."
                  : "You have no complaints with this status."
              }
              action={
                all.length === 0 && (
                  <Link to="/report-issue" className="primary-button">Report an Issue</Link>
                )
              }
            />
          )}
        </>
      )}
    </AppLayout>
  );
}

export default MyComplaints;
