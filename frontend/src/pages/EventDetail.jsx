import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { formatDate, formatMoney } from "../constants";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [buying, setBuying] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    quantity: 1,
  });

  useEffect(() => {
    api.getEvent(id).then(setEvent).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="error-box">Error: {error}</div>;
  if (!event) return <div className="muted">Loading…</div>;

  const soldOut = event.tickets_available === 0;
  const maxQty = Math.min(10, event.tickets_available);
  const total = form.quantity * event.price_cents;

  async function buy(e) {
    e.preventDefault();
    setBuying(true);
    setError(null);
    try {
      const order = await api.createOrder({
        event_id: event.id,
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        quantity: Number(form.quantity),
      });
      navigate(`/confirmation/${order.code}`);
    } catch (err) {
      setError(err.message);
      setBuying(false);
    }
  }

  return (
    <div>
      <Link to="/" className="back-link">
        ← Back to events
      </Link>

      <div className="detail-hero">
        <div
          className="detail-image"
          style={
            event.image_url
              ? { backgroundImage: `url(${event.image_url})` }
              : undefined
          }
        >
          <span className={`cat-chip cat-${event.category}`}>
            {event.category}
          </span>
        </div>
      </div>

      <div className="detail-grid">
        <div>
          <h1>{event.title}</h1>
          <div className="detail-meta">
            <div>📅 {formatDate(event.starts_at)}</div>
            <div>📍 {event.venue}, {event.city}</div>
          </div>
          <p className="desc">{event.description}</p>
        </div>

        <aside className="panel buy-box">
          <div className="buy-price">{formatMoney(event.price_cents)}</div>
          <div className="muted small">per ticket</div>

          {soldOut ? (
            <div className="soldout-banner">This event is sold out</div>
          ) : (
            <>
              <div className="tickets-left">
                {event.tickets_available} tickets left
              </div>
              <form onSubmit={buy} className="form">
                <label className="field">
                  <span>Quantity</span>
                  <select
                    className="input"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, quantity: e.target.value }))
                    }
                  >
                    {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Full name</span>
                  <input
                    className="input"
                    required
                    value={form.customer_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, customer_name: e.target.value }))
                    }
                  />
                </label>
                <label className="field">
                  <span>Email</span>
                  <input
                    className="input"
                    type="email"
                    required
                    value={form.customer_email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, customer_email: e.target.value }))
                    }
                  />
                </label>

                <div className="total-row">
                  <span>Total</span>
                  <strong>{formatMoney(total)}</strong>
                </div>

                {error && <div className="error-box">{error}</div>}

                <button className="btn btn-primary btn-block" disabled={buying}>
                  {buying ? "Processing…" : `Buy ${form.quantity} ticket(s)`}
                </button>
              </form>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
