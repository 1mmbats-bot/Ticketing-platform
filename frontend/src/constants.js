export const STATUSES = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export const CATEGORIES = [
  "general",
  "authentication",
  "billing",
  "api",
  "feature",
  "bug",
];

export const statusLabel = (v) =>
  STATUSES.find((s) => s.value === v)?.label || v;
export const priorityLabel = (v) =>
  PRIORITIES.find((p) => p.value === v)?.label || v;

export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
