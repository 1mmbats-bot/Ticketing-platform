import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { PriorityBadge, StatusBadge } from "../components/Badges.jsx";
import { PRIORITIES, STATUSES, formatDate } from "../constants";

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: "", priority: "", search: "" });

  function load() {
    setLoading(true);
    api
      .listTickets(filters)
      .then((data) => {
        setTickets(data);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.priority]);

  function onSearchSubmit(e) {
    e.preventDefault();
    load();
  }

  return (
    <div>
      <div className="page-head">
        <h1>Tickets</h1>
        <Link to="/tickets/new" className="btn btn-primary">
          + New Ticket
        </Link>
      </div>

      <div className="toolbar">
        <form onSubmit={onSearchSubmit} className="search-form">
          <input
            className="input"
            placeholder="Search title or description…"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
          <button className="btn">Search</button>
        </form>

        <select
          className="input"
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          className="input"
          value={filters.priority}
          onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-box">Error: {error}</div>}
      {loading ? (
        <div className="muted">Loading…</div>
      ) : tickets.length === 0 ? (
        <div className="muted empty">No tickets match your filters.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Requester</th>
              <th>Assignee</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td className="muted">#{t.id}</td>
                <td>
                  <Link to={`/tickets/${t.id}`} className="link">
                    {t.title}
                  </Link>
                  <div className="cat-tag">{t.category}</div>
                </td>
                <td>
                  <StatusBadge status={t.status} />
                </td>
                <td>
                  <PriorityBadge priority={t.priority} />
                </td>
                <td>{t.requester_name}</td>
                <td>{t.assignee ? t.assignee.name : <span className="muted">—</span>}</td>
                <td className="muted">{formatDate(t.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
