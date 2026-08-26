import { Link } from "react-router-dom";
import { formatMoney, getMonthDay, getTime } from "../constants";

export default function EventCard({ event }) {
  const soldOut = event.tickets_available === 0;
  const almostGone = !soldOut && event.tickets_available <= event.capacity * 0.1;
  const { month, day } = getMonthDay(event.starts_at);
  const time = getTime(event.starts_at);

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
        <div className="event-date-badge">
          <span className="month">{month}</span>
          <span className="day">{day}</span>
        </div>
        {soldOut && <span className="event-badge-right badge-soldout">Sold Out</span>}
        {almostGone && <span className="event-badge-right badge-almost">Almost Gone</span>}
      </div>
      <div className="event-body">
        <h3 className="event-title">{event.title}</h3>
        <div className="event-venue">
          {event.venue} &middot; {event.city}
        </div>
        {time && <div className="event-time">{time}</div>}
        <div className="event-foot">
          <div>
            <div className="event-price">{formatMoney(event.price_cents)}</div>
            <div className="event-price-label">
              {soldOut ? "Unavailable" : `${event.tickets_available} tickets left`}
            </div>
          </div>
          <span className="event-action">
            {soldOut ? "View" : "Get Tickets"}
          </span>
        </div>
      </div>
    </Link>
  );
}
