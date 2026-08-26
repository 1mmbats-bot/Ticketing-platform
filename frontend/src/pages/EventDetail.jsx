import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { CATEGORY_META, formatDate, formatMoney, getTime } from "../constants";

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
  if (!event) return <div className="muted" style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  const soldOut = event.tickets_available === 0;
  const maxQty = Math.min(10, event.tickets_available);
  const total = quantity * event.price_cents;
  const catMeta = CATEGORY_META[event.category];

  function goToCheckout(e) {
    e.preventDefault();
    navigate(`/checkout/${event.id}?qty=${quantity}`);
  }

  return (
    <div>
      <Link to="/" className="back-link">
        &larr; Back to events
      </Link>

      <div
        className="detail-hero-img"
        style={
          event.image_url
            ? { backgroundImage: `url(${event.image_url})` }
            : undefined
        }
      >
        <span className="cat-chip">
          {catMeta?.icon} {catMeta?.label || event.category}
        </span>
      </div>

      <div className="detail-grid">
        <div className="detail-info">
          <h1>{event.title}</h1>
          <div className="detail-meta">
            <div className="detail-meta-item">
              <span className="detail-meta-icon">&#128197;</span>
              <div>
                <div style={{ fontWeight: 600, color: "var(--text)" }}>{formatDate(event.starts_at)}</div>
                <div className="small muted">{getTime(event.starts_at)}</div>
              </div>
            </div>
            <div className="detail-meta-item">
              <span className="detail-meta-icon">&#128205;</span>
              <div>
                <div style={{ fontWeight: 600, color: "var(--text)" }}>{event.venue}</div>
                <div className="small muted">{event.city}</div>
              </div>
            </div>
          </div>
          <div className="detail-desc">{event.description}</div>
        </div>

        <aside className="buy-box">
          <div className="buy-price">{formatMoney(event.price_cents)}</div>
          <div className="buy-price-sub">per ticket</div>

          {soldOut ? (
            <div className="soldout-banner">This event is sold out</div>
          ) : (
            <>
              <div className="tickets-left">
                <span className="tickets-left-dot" />
                {event.tickets_available} tickets left
              </div>

              <form onSubmit={goToCheckout}>
                <div className="qty-select">
                  <label>Quantity</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  >
                    {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <div className="total-row">
                  <span>Total</span>
                  <strong>{formatMoney(total)}</strong>
                </div>

                <button className="btn btn-primary btn-block">
                  Get Tickets
                </button>
              </form>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
