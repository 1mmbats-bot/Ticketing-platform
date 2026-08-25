import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { formatDate, formatMoney } from "../constants";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    api.getEvent(id).then(setEvent).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="error-box">Error: {error}</div>;
  if (!event) return <div className="muted">Loading…</div>;

  const soldOut = event.tickets_available === 0;
  const maxQty = Math.min(10, event.tickets_available);
  const total = quantity * event.price_cents;

  function goToCheckout(e) {
    e.preventDefault();
    navigate(`/checkout/${event.id}?qty=${quantity}`);
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
              <form onSubmit={goToCheckout} className="form">
                <label className="field">
                  <span>Quantity</span>
                  <select
                    className="input"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  >
                    {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="total-row">
                  <span>Total</span>
                  <strong>{formatMoney(total)}</strong>
                </div>

                <button className="btn btn-primary btn-block">
                  Continue to checkout →
                </button>
              </form>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
