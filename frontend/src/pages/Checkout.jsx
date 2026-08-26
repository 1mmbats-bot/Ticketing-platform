import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { PAYMENT_METHODS, formatDate, formatMoney } from "../constants";

export default function Checkout() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const initialQty = Math.max(1, parseInt(searchParams.get("qty") || "1", 10));
  const [form, setForm] = useState({
    quantity: initialQty,
    customer_name: "",
    customer_email: "",
    phone: "",
    payment_method: "mpesa",
    payment_reference: "",
  });

  useEffect(() => {
    api.getEvent(id).then(setEvent).catch((e) => setError(e.message));
  }, [id]);

  const method = useMemo(
    () => PAYMENT_METHODS.find((m) => m.value === form.payment_method),
    [form.payment_method]
  );

  if (error) return <div className="error-box">Error: {error}</div>;
  if (!event) return <div className="muted" style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  const soldOut = event.tickets_available === 0;
  const maxQty = Math.min(10, event.tickets_available);
  const total = form.quantity * event.price_cents;

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const order = await api.createOrder({
        event_id: event.id,
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        phone: form.phone,
        quantity: Number(form.quantity),
        payment_method: form.payment_method,
        payment_reference: form.payment_reference,
      });
      navigate(`/confirmation/${order.code}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  if (soldOut)
    return (
      <div className="narrow">
        <div className="error-box">Sorry, this event is sold out.</div>
        <Link to="/" className="btn btn-outline">&larr; Back to events</Link>
      </div>
    );

  return (
    <div>
      <Link to={`/events/${event.id}`} className="back-link">
        &larr; Back to event
      </Link>
      <div className="page-head">
        <h1>Checkout</h1>
      </div>

      <div className="checkout-grid">
        <form onSubmit={submit} className="form">
          <div className="panel">
            <h2>Your details</h2>
            <div className="field-row">
              <label className="field">
                <span>Full name *</span>
                <input
                  className="input"
                  required
                  value={form.customer_name}
                  onChange={(e) => set("customer_name", e.target.value)}
                />
              </label>
              <label className="field">
                <span>Email *</span>
                <input
                  className="input"
                  type="email"
                  required
                  value={form.customer_email}
                  onChange={(e) => set("customer_email", e.target.value)}
                />
              </label>
            </div>
            <div className="field-row">
              <label className="field">
                <span>Phone *</span>
                <input
                  className="input"
                  required
                  placeholder="+254..."
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </label>
              <label className="field">
                <span>Quantity</span>
                <select
                  className="input"
                  value={form.quantity}
                  onChange={(e) => set("quantity", Number(e.target.value))}
                >
                  {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="panel">
            <h2>Payment method</h2>
            <div className="pay-methods">
              {PAYMENT_METHODS.map((m) => (
                <button
                  type="button"
                  key={m.value}
                  className={`pay-option ${form.payment_method === m.value ? "pay-active" : ""}`}
                  onClick={() => set("payment_method", m.value)}
                >
                  <span className="pay-icon">{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>

            {method && (
              <>
                <div className="pay-instructions">{method.instructions}</div>
                <label className="field">
                  <span>{method.refLabel}</span>
                  <input
                    className="input"
                    placeholder={method.placeholder}
                    value={form.payment_reference}
                    onChange={(e) => set("payment_reference", e.target.value)}
                  />
                </label>
              </>
            )}
          </div>

          {error && <div className="error-box">{error}</div>}

          <button className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Placing order..." : `Place order · ${formatMoney(total)}`}
          </button>
        </form>

        <aside className="panel">
          <h2>Order summary</h2>
          <div className="summary-event">
            <strong>{event.title}</strong>
            <div className="muted small">{formatDate(event.starts_at)}</div>
            <div className="muted small">{event.venue}, {event.city}</div>
          </div>
          <div className="receipt">
            <div className="receipt-row">
              <span>{formatMoney(event.price_cents)} &times; {form.quantity}</span>
              <span>{formatMoney(total)}</span>
            </div>
            <div className="receipt-row total">
              <span>Total</span>
              <strong>{formatMoney(total)}</strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
