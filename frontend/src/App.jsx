import { Link, NavLink, Route, Routes } from "react-router-dom";
import Events from "./pages/Events.jsx";
import EventDetail from "./pages/EventDetail.jsx";
import Checkout from "./pages/Checkout.jsx";
import Confirmation from "./pages/Confirmation.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-dot" /> TicketHub
        </Link>
        <nav className="nav">
          <NavLink to="/" end>
            Browse
          </NavLink>
          <NavLink to="/orders">My Orders</NavLink>
          <NavLink to="/admin">Admin</NavLink>
        </nav>
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
        TicketHub — a demo event ticketing platform · React + FastAPI
      </footer>
    </div>
  );
}
