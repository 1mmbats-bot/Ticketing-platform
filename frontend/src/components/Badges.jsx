import { priorityLabel, statusLabel } from "../constants";

export function StatusBadge({ status }) {
  return <span className={`badge status-${status}`}>{statusLabel(status)}</span>;
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`badge priority-${priority}`}>
      {priorityLabel(priority)}
    </span>
  );
}
