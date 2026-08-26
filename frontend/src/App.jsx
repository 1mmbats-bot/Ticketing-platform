import { useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import Events from "./pages/Events.jsx";
import EventDetail from "./pages/EventDetail.jsx";
import Checkout from "./pages/Checkout.jsx";
import Confirmation from "./pages/Confirmation.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  function handleHeaderSearch(e) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?search=${encodeURIComponent(search.trim())}`);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <Link to="/" className="logo">
            <span className="logo-icon">T</span>
            Ticketmaster
          </Link>

          <form className="header-search" onSubmit={handleHeaderSearch}>
            <span className="header-search-icon">&#128269;</span>
            <input
              type="text"
              placeholder="Search events, artists, venues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          <div className="header-actions">
            <NavLink to="/" end className={({ isActive }) => `header-link ${isActive ? "active" : ""}`}>
              Events
            </NavLink>
            <NavLink to="/orders" className={({ isActive }) => `header-link ${isActive ? "active" : ""}`}>
              My Tickets
            </NavLink>
            <NavLink to="/admin" className={({ isActive }) => `header-link ${isActive ? "active" : ""}`}>
              Admin
            </NavLink>
          </div>
        </div>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/confirmation/:code" element={<Confirmation />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      <footer className="footer">
        Ticketmaster Clone &mdash; Event Ticketing Platform &middot; React + FastAPI
      </footer>
    </div>
  );
}
