import { Link } from "react-router-dom";
import { formatDateShort, formatMoney } from "../constants";

export default function EventCard({ event }) {
  const soldOut = event.tickets_available === 0;
  const almostGone = !soldOut && event.tickets_available <= event.capacity * 0.1;

  return (
    <Link to={`/events/${event.id}`} className="event-card">
      <div
        className="event-thumb"
        style={
          event.image_url
            ? { backgroundImage: `url(${event.image_url})` }
            : undefined
        }
      >
        <span className={`cat-chip cat-${event.category}`}>{event.category}</span>
        {soldOut && <span className="soldout-chip">Sold Out</span>}
        {almostGone && <span className="almost-chip">Almost Gone</span>}
      </div>
      <div className="event-body">
        <div className="event-date">{formatDateShort(event.starts_at)}</div>
        <h3 className="event-title">{event.title}</h3>
        <div className="event-meta">
          {event.venue} · {event.city}
        </div>
        <div className="event-foot">
          <span className="event-price">{formatMoney(event.price_cents)}</span>
          <span className="event-left">
            {soldOut ? "—" : `${event.tickets_available} left`}
          </span>
        </div>
      </div>
    </Link>
  );
}
