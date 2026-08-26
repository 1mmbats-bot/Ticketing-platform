import { useEffect, useState } from "react";
import { api } from "../api";
import {
  CATEGORIES,
  formatDateShort,
  formatMoney,
  paymentLabel,
  toDatetimeLocal,
} from "../constants";

const emptyForm = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  d.setHours(19, 0, 0, 0);
  return {
    title: "",
    description: "",
    category: "music",
    venue: "",
    city: "",
    starts_at: toDatetimeLocal(d),
    price: "25.00",
    capacity: "100",
    image_url: "",
  };
};

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function refresh() {
    api.stats().then(setStats).catch((e) => setError(e.message));
    api.listEvents().then(setEvents).catch((e) => setError(e.message));
    api.listOrders().then(setOrders).catch((e) => setError(e.message));
  }

  async function setPaid(code, status) {
    try {
      await api.setPaymentStatus(code, status);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function createEvent(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.createEvent({
        title: form.title,
        description: form.description,
        category: form.category,
        venue: form.venue,
        city: form.city,
        starts_at: new Date(form.starts_at).toISOString(),
        price_cents: Math.round(parseFloat(form.price || "0") * 100),
        capacity: parseInt(form.capacity || "0", 10),
        image_url: form.image_url,
      });
      setForm(emptyForm());
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this event and all its orders?")) return;
    try {
      await api.deleteEvent(id);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="page-head">
        <h1>Organizer Dashboard</h1>
      </div>

      {error && <div className="error-box">Error: {error}</div>}

      {stats && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total_events}</div>
            <div className="stat-label">Events</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.upcoming_events}</div>
            <div className="stat-label">Upcoming</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.tickets_sold}</div>
            <div className="stat-label">Tickets Sold</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatMoney(stats.revenue_cents)}</div>
            <div className="stat-label">Revenue</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.orders}</div>
            <div className="stat-label">Orders</div>
          </div>
        </div>
      )}

      {stats && stats.top_events.length > 0 && (
        <div className="panel">
          <h2>Best sellers</h2>
          <div className="bars">
            {stats.top_events.map((e) => {
              const max = Math.max(1, ...stats.top_events.map((x) => x.sold));
              return (
                <div key={e.title} className="bar-row">
                  <div className="bar-label" title={e.title}>
                    {e.title.length > 24 ? e.title.slice(0, 24) + "..." : e.title}
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${(e.sold / max) * 100}%` }}
                    />
                  </div>
                  <div className="bar-val">{e.sold}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="admin-cols">
        <form onSubmit={createEvent} className="form panel">
          <h2>Create event</h2>
          <label className="field">
            <span>Title *</span>
            <input className="input" required value={form.title} onChange={(e) => set("title", e.target.value)} />
          </label>
          <label className="field">
            <span>Description</span>
            <textarea className="input" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </label>
          <div className="field-row">
            <label className="field">
              <span>Category</span>
              <select className="input" value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Date & time *</span>
              <input className="input" type="datetime-local" required value={form.starts_at} onChange={(e) => set("starts_at", e.target.value)} />
            </label>
          </div>
          <div className="field-row">
            <label className="field">
              <span>Venue *</span>
              <input className="input" required value={form.venue} onChange={(e) => set("venue", e.target.value)} />
            </label>
            <label className="field">
              <span>City *</span>
              <input className="input" required value={form.city} onChange={(e) => set("city", e.target.value)} />
            </label>
          </div>
          <div className="field-row">
            <label className="field">
              <span>Price (USD)</span>
              <input className="input" type="number" min="0" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} />
            </label>
            <label className="field">
              <span>Capacity</span>
              <input className="input" type="number" min="1" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} />
            </label>
          </div>
          <label className="field">
            <span>Image URL</span>
            <input className="input" placeholder="https://..." value={form.image_url} onChange={(e) => set("image_url", e.target.value)} />
          </label>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Creating..." : "Create event"}
          </button>
        </form>

        <div className="panel">
          <h2>All events ({events.length})</h2>
          <div className="admin-list">
            {events.map((e) => (
              <div key={e.id} className="admin-item">
                <div>
                  <div className="admin-title">{e.title}</div>
                  <div className="muted small">
                    {formatDateShort(e.starts_at)} &middot; {e.city} &middot; {formatMoney(e.price_cents)}
                  </div>
                </div>
                <div className="admin-item-side">
                  <div className="sold-pill">
                    {e.tickets_sold}/{e.capacity} sold
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(e.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>Recent orders ({orders.length})</h2>
        {orders.length === 0 ? (
          <div className="muted" style={{ padding: 20 }}>No orders yet.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Event</th>
                <th>Buyer</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Method</th>
                <th>Payment</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="code-value small">{o.code}</td>
                  <td>{o.event ? o.event.title : "—"}</td>
                  <td>
                    {o.customer_name}
                    <div className="muted small">{o.phone || o.customer_email}</div>
                  </td>
                  <td>{o.quantity}</td>
                  <td>{formatMoney(o.total_cents)}</td>
                  <td>{paymentLabel(o.payment_method)}</td>
                  <td>
                    <span className={`badge pay-${o.payment_status}`}>
                      {o.payment_status}
                    </span>
                  </td>
                  <td>
                    {o.payment_status !== "paid" ? (
                      <button
                        className="btn btn-sm"
                        onClick={() => setPaid(o.code, "paid")}
                      >
                        Mark paid
                      </button>
                    ) : (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setPaid(o.code, "pending")}
                      >
                        Undo
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
