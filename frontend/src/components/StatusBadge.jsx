import { statusSlug } from "../utils/helpers";

function StatusBadge({ status }) {
  return <span className={`status status-${statusSlug(status)}`}>{status}</span>;
}

export default StatusBadge;
