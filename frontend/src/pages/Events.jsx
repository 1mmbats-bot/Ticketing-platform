import { useEffect, useState } from "react";
import { api } from "../api";
import EventCard from "../components/EventCard.jsx";
import { CATEGORIES } from "../constants";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: "", category: "" });

  function load() {
    setLoading(true);
    api
      .listEvents({ ...filters, upcoming_only: true })
      .then((data) => {
        setEvents(data);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category]);

  return (
    <div>
      <section className="hero">
        <h1>Find your next experience</h1>
        <p>Concerts, sports, theater and more — book tickets in seconds.</p>
        <form
          className="hero-search"
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
        >
          <input
            className="input"
            placeholder="Search events…"
            value={filters.search}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value }))
            }
          />
          <button className="btn btn-primary">Search</button>
        </form>
      </section>

      <div className="chips">
        <button
          className={`chip ${filters.category === "" ? "chip-active" : ""}`}
          onClick={() => setFilters((f) => ({ ...f, category: "" }))}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`chip ${filters.category === c ? "chip-active" : ""}`}
            onClick={() => setFilters((f) => ({ ...f, category: c }))}
          >
            {c}
          </button>
        ))}
      </div>

      {error && <div className="error-box">Error: {error}</div>}
      {loading ? (
        <div className="muted">Loading events…</div>
      ) : events.length === 0 ? (
        <div className="muted empty">No upcoming events match your search.</div>
      ) : (
        <div className="event-grid">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
