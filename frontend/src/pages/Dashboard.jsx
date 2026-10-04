import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  Plus,
  User,
} from "lucide-react";

import AppLayout from "../components/AppLayout";
import ComplaintCard from "../components/ComplaintCard";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import StatsCard from "../components/StatsCard";
import useAsync from "../hooks/useAsync";
import useAuth from "../hooks/useAuth";
import { getComplaintStats, getMyComplaints } from "../services/complaintService";
import { getGreeting } from "../utils/helpers";

const QUICK_ACTIONS = [
  { label: "Report Issue", text: "Tell the city about a new problem.", to: "/report-issue", icon: FileText },
  { label: "My Complaints", text: "See the status of your reports.", to: "/my-complaints", icon: ClipboardList },
  { label: "Profile", text: "View and update your details.", to: "/profile", icon: User },
];

function Dashboard() {
  const { user } = useAuth();

  const { data, loading, error, reload } = useAsync(async () => {
    const [stats, complaints] = await Promise.all([getComplaintStats(), getMyComplaints()]);

    // The API returns newest first.
    return { stats, recent: complaints.slice(0, 3) };
  });

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <AppLayout
      title={`${getGreeting()}, ${firstName}`}
      description="Track your complaints and help improve your city."
      actions={
        <Link to="/report-issue" className="primary-button">
          <Plus size={18} />
          Report an Issue
        </Link>
      }
    >
      {loading && <Loader label="Loading your dashboard…" />}

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

          <section className="panel">
            <div className="panel-head">
              <h2>Recent complaints</h2>
              <Link to="/my-complaints" className="text-link">
                View all
                <ArrowRight size={16} />
              </Link>
            </div>

            {data.recent.length > 0 ? (
              <div className="complaint-stack">
                {data.recent.map((complaint) => (
                  <ComplaintCard key={complaint.id} complaint={complaint} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No complaints yet"
                message="Report your first civic issue and it will show up here."
                action={<Link to="/report-issue" className="primary-button">Report an Issue</Link>}
              />
            )}
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>Quick actions</h2>
            </div>

            <div className="quick-grid">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;

                return (
                  <Link to={action.to} className="quick-card" key={action.label}>
                    <span className="hm-icon">
                      <Icon size={20} />
                    </span>
                    <div>
                      <h3>{action.label}</h3>
                      <p>{action.text}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      )}
    </AppLayout>
  );
}

export default Dashboard;
