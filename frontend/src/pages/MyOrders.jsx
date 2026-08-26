import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { formatDate, formatMoney, paymentLabel } from "../constants";

export default function MyOrders() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function lookup(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.listOrders(email.trim());
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function cancel(code) {
    if (!window.confirm("Cancel this order? Tickets will be released.")) return;
    try {
      await api.cancelOrder(code);
      lookup({ preventDefault: () => {} });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="narrow">
      <div className="page-head">
        <h1>My Tickets</h1>
      </div>
      <p className="muted" style={{ marginBottom: 20 }}>
        Enter the email you used at checkout to find your bookings.
      </p>

      <form onSubmit={lookup} className="search-form">
        <input
          className="input"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn btn-primary">Find</button>
      </form>

      {error && <div className="error-box">Error: {error}</div>}
      {loading && <div className="muted" style={{ padding: 20, textAlign: "center" }}>Searching...</div>}

      {orders && orders.length === 0 && (
        <div className="empty">
          <div style={{ fontSize: 48, marginBottom: 12 }}>&#128269;</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>No orders found</div>
          <div>No orders found for that email address.</div>
        </div>
      )}

      {orders && orders.length > 0 && (
        <div className="order-list">
          {orders.map((o) => (
            <div key={o.id} className="panel order-item">
              <div className="order-main">
                <div className="code-value small">{o.code}</div>
                {o.event ? (
                  <Link to={`/events/${o.event.id}`} className="link">
                    {o.event.title}
                  </Link>
                ) : (
                  <span className="muted">Event removed</span>
                )}
                {o.event && (
                  <div className="muted small">{formatDate(o.event.starts_at)}</div>
                )}
              </div>
              <div className="order-side">
                <div style={{ fontWeight: 700 }}>
                  {o.quantity} &times; {formatMoney(o.total_cents)}
                </div>
                <div className="muted small">{paymentLabel(o.payment_method)}</div>
                <span className={`badge pay-${o.payment_status}`}>
                  {o.payment_status}
                </span>
                <span className={`badge status-${o.status}`}>{o.status}</span>
                {o.status === "confirmed" && (
                  <button className="btn btn-danger btn-sm" onClick={() => cancel(o.code)}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
