import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { PRIORITIES } from "../constants";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.stats().then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="error-box">Error: {error}</div>;
  if (!stats) return <div className="muted">Loading…</div>;

  const cards = [
    { label: "Total", value: stats.total, cls: "" },
    { label: "Open", value: stats.open, cls: "status-open" },
    { label: "In Progress", value: stats.in_progress, cls: "status-in_progress" },
    { label: "Resolved", value: stats.resolved, cls: "status-resolved" },
    { label: "Closed", value: stats.closed, cls: "status-closed" },
    { label: "Unassigned", value: stats.unassigned, cls: "warn" },
  ];

  const maxPriority = Math.max(1, ...Object.values(stats.by_priority));

  return (
    <div>
      <div className="page-head">
        <h1>Dashboard</h1>
        <Link to="/tickets/new" className="btn btn-primary">
          + New Ticket
        </Link>
      </div>

      <div className="stat-grid">
        {cards.map((c) => (
          <div key={c.label} className={`stat-card ${c.cls}`}>
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <h2>Tickets by priority</h2>
        <div className="bars">
          {PRIORITIES.map((p) => {
            const val = stats.by_priority[p.value] || 0;
            return (
              <div key={p.value} className="bar-row">
                <div className="bar-label">{p.label}</div>
                <div className="bar-track">
                  <div
                    className={`bar-fill priority-${p.value}`}
                    style={{ width: `${(val / maxPriority) * 100}%` }}
                  />
                </div>
                <div className="bar-val">{val}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
