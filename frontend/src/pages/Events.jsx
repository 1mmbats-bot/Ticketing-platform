import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import EventCard from "../components/EventCard.jsx";
import { CATEGORIES, CATEGORY_META } from "../constants";

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";

  function setCategory(c) {
    const p = new URLSearchParams(searchParams);
    if (c) p.set("category", c);
    else p.delete("category");
    setSearchParams(p, { replace: true });
  }

  function load() {
    setLoading(true);
    api
      .listEvents({ search, category, upcoming_only: true })
      .then((data) => {
        setEvents(data);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [category, search]);

  return (
    <div>
      <section className="hero">
        <h1>Discover Events Near You</h1>
        <p>Concerts, sports, theater, comedy and more — find your next experience.</p>
        <form className="hero-search" onSubmit={(e) => { e.preventDefault(); load(); }}>
          <input
            placeholder="Search events, artists, venues..."
            value={search}
            onChange={(e) => {
              const p = new URLSearchParams(searchParams);
              if (e.target.value) p.set("search", e.target.value);
              else p.delete("search");
              setSearchParams(p, { replace: true });
            }}
          />
          <button type="submit">Search</button>
        </form>
      </section>

      <nav className="cat-nav">
        <div className="cat-nav-inner">
          {CATEGORIES.map((c) => {
            const meta = CATEGORY_META[c];
            return (
              <button
                key={c}
                className={`cat-tab ${category === c ? "cat-tab-active" : ""}`}
                onClick={() => setCategory(category === c ? "" : c)}
              >
                <span className="cat-tab-icon">{meta.icon}</span>
                {meta.label}
              </button>
            );
          })}
        </div>
      </nav>

      <div style={{ paddingTop: 24 }}>
        {error && <div className="error-box">Error: {error}</div>}

        {loading ? (
          <div className="muted" style={{ padding: 40, textAlign: "center" }}>Loading events...</div>
        ) : events.length === 0 ? (
          <div className="empty">
            <div style={{ fontSize: 48, marginBottom: 12 }}>&#128269;</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>No events found</div>
            <div>Try adjusting your search or browse a different category.</div>
          </div>
        ) : (
          <>
            <div className="section-head">
              <h2>{category ? CATEGORY_META[category]?.label || "Events" : "All Events"}</h2>
              <span className="count">{events.length} event{events.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="event-grid">
              {events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
