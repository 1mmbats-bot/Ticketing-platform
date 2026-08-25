import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { formatDate, formatMoney } from "../constants";

export default function Confirmation() {
  const { code } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getOrder(code).then(setOrder).catch((e) => setError(e.message));
  }, [code]);

  if (error) return <div className="error-box">Error: {error}</div>;
  if (!order) return <div className="muted">Loading…</div>;

  return (
    <div className="narrow">
      <div className="confirm-card panel">
        <div className="confirm-check">✓</div>
        <h1>You're going!</h1>
        <p className="muted">
          Your booking is confirmed. A confirmation was sent to{" "}
          {order.customer_email}.
        </p>

        <div className="booking-code">
          <span className="muted small">Booking reference</span>
          <div className="code-value">{order.code}</div>
        </div>

        {order.event && (
          <div className="confirm-event">
            <h2>{order.event.title}</h2>
            <div className="detail-meta">
              <div>📅 {formatDate(order.event.starts_at)}</div>
              <div>
                📍 {order.event.venue}, {order.event.city}
              </div>
            </div>
          </div>
        )}

        <div className="receipt">
          <div className="receipt-row">
            <span>Tickets</span>
            <span>{order.quantity}</span>
          </div>
          <div className="receipt-row">
            <span>Status</span>
            <span className={`badge status-${order.status}`}>{order.status}</span>
          </div>
          <div className="receipt-row total">
            <span>Total paid</span>
            <strong>{formatMoney(order.total_cents)}</strong>
          </div>
        </div>

        <div className="form-actions">
          <Link to="/orders" className="btn">
            View my orders
          </Link>
          <Link to="/" className="btn btn-primary">
            Browse more events
          </Link>
        </div>
      </div>
    </div>
  );
}
