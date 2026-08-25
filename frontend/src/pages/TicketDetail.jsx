import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { PriorityBadge, StatusBadge } from "../components/Badges.jsx";
import { PRIORITIES, STATUSES, formatDate } from "../constants";

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState({ author: "", body: "" });
  const [busy, setBusy] = useState(false);

  function load() {
    api.getTicket(id).then(setTicket).catch((e) => setError(e.message));
  }

  useEffect(() => {
    load();
    api.listUsers().then(setUsers).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function patch(changes) {
    setBusy(true);
    try {
      const updated = await api.updateTicket(id, changes);
      setTicket(updated);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!comment.author.trim() || !comment.body.trim()) return;
    setBusy(true);
    try {
      await api.addComment(id, comment);
      setComment({ author: comment.author, body: "" });
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!window.confirm("Delete this ticket permanently?")) return;
    await api.deleteTicket(id);
    navigate("/tickets");
  }

  if (error) return <div className="error-box">Error: {error}</div>;
  if (!ticket) return <div className="muted">Loading…</div>;

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="muted">Ticket #{ticket.id}</div>
          <h1>{ticket.title}</h1>
        </div>
        <button className="btn btn-danger" onClick={onDelete}>
          Delete
        </button>
      </div>

      <div className="detail-grid">
        <div className="panel">
          <h2>Description</h2>
          <p className="desc">
            {ticket.description || <span className="muted">No description provided.</span>}
          </p>

          <h2>Activity</h2>
          <div className="comments">
            {ticket.comments.length === 0 && (
              <div className="muted">No comments yet.</div>
            )}
            {ticket.comments.map((c) => (
              <div key={c.id} className="comment">
                <div className="comment-head">
                  <strong>{c.author}</strong>
                  <span className="muted">{formatDate(c.created_at)}</span>
                </div>
                <div className="comment-body">{c.body}</div>
              </div>
            ))}
          </div>

          <form onSubmit={submitComment} className="comment-form">
            <input
              className="input"
              placeholder="Your name"
              value={comment.author}
              onChange={(e) => setComment((c) => ({ ...c, author: e.target.value }))}
            />
            <textarea
              className="input"
              rows={3}
              placeholder="Add a comment…"
              value={comment.body}
              onChange={(e) => setComment((c) => ({ ...c, body: e.target.value }))}
            />
            <button className="btn btn-primary" disabled={busy}>
              Add Comment
            </button>
          </form>
        </div>

        <aside className="panel side">
          <div className="side-row">
            <span className="side-label">Status</span>
            <StatusBadge status={ticket.status} />
          </div>
          <select
            className="input"
            value={ticket.status}
            disabled={busy}
            onChange={(e) => patch({ status: e.target.value })}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <div className="side-row">
            <span className="side-label">Priority</span>
            <PriorityBadge priority={ticket.priority} />
          </div>
          <select
            className="input"
            value={ticket.priority}
            disabled={busy}
            onChange={(e) => patch({ priority: e.target.value })}
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <div className="side-row">
            <span className="side-label">Assignee</span>
          </div>
          <select
            className="input"
            value={ticket.assignee_id || ""}
            disabled={busy}
            onChange={(e) =>
              patch({ assignee_id: e.target.value ? Number(e.target.value) : null })
            }
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          <hr />
          <div className="meta">
            <div>
              <span className="side-label">Category</span> {ticket.category}
            </div>
            <div>
              <span className="side-label">Requester</span> {ticket.requester_name}
            </div>
            <div className="muted small">{ticket.requester_email}</div>
            <div>
              <span className="side-label">Created</span> {formatDate(ticket.created_at)}
            </div>
            <div>
              <span className="side-label">Updated</span> {formatDate(ticket.updated_at)}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
