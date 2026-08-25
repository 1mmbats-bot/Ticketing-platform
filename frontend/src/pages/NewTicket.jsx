import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { CATEGORIES, PRIORITIES } from "../constants";

export default function NewTicket() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "general",
    requester_name: "",
    requester_email: "",
    assignee_id: "",
  });

  useEffect(() => {
    api.listUsers().then(setUsers).catch(() => {});
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        assignee_id: form.assignee_id ? Number(form.assignee_id) : null,
      };
      const ticket = await api.createTicket(payload);
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="narrow">
      <div className="page-head">
        <h1>New Ticket</h1>
      </div>

      {error && <div className="error-box">Error: {error}</div>}

      <form onSubmit={onSubmit} className="form panel">
        <label className="field">
          <span>Title *</span>
          <input
            className="input"
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Short summary of the issue"
          />
        </label>

        <label className="field">
          <span>Description</span>
          <textarea
            className="input"
            rows={5}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Steps to reproduce, context, etc."
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Priority</span>
            <select
              className="input"
              value={form.priority}
              onChange={(e) => set("priority", e.target.value)}
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Category</span>
            <select
              className="input"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Assignee</span>
            <select
              className="input"
              value={form.assignee_id}
              onChange={(e) => set("assignee_id", e.target.value)}
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="field-row">
          <label className="field">
            <span>Requester name *</span>
            <input
              className="input"
              required
              value={form.requester_name}
              onChange={(e) => set("requester_name", e.target.value)}
            />
          </label>
          <label className="field">
            <span>Requester email *</span>
            <input
              className="input"
              type="email"
              required
              value={form.requester_email}
              onChange={(e) => set("requester_email", e.target.value)}
            />
          </label>
        </div>

        <div className="form-actions">
          <button className="btn" type="button" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Creating…" : "Create Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}
