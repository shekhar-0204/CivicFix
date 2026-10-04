import { AlertCircle, SearchX, TriangleAlert } from "lucide-react";

const ICONS = {
  empty: AlertCircle,
  notfound: SearchX,
  error: TriangleAlert,
};

// One component for empty, not-found and error screens.
function EmptyState({ type = "empty", title, message, action }) {
  const Icon = ICONS[type] || AlertCircle;

  return (
    <div className={`state-box state-${type}`}>
      <div className="state-icon">
        <Icon size={24} />
      </div>

      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action && <div className="state-action">{action}</div>}
    </div>
  );
}

export default EmptyState;
