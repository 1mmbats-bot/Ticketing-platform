# TicketHub — Event Ticketing Platform

A full-stack platform where people **buy tickets for events** (concerts, sports,
theater, conferences, comedy). Browse events, purchase tickets, get a booking
reference, look up or cancel orders, and manage events from an organizer
dashboard.

- **Backend:** Python · FastAPI · SQLAlchemy · SQLite
- **Frontend:** React · Vite · React Router

## Features

### For attendees
- Browse & search upcoming events, filter by category
- Event detail pages with live availability
- Buy tickets (1–10 per order) with real inventory checks
- Sold-out / almost-gone handling
- Booking confirmation with a unique reference code (`TKT-XXXXXX`)
- Look up all your orders by email; cancel to release tickets

### For organizers (Admin)
- Dashboard: total events, upcoming, tickets sold, revenue, order count
- Best-sellers chart
- Create / delete events
- Per-event sold vs. capacity

## Business rules (enforced server-side)
- Cannot buy more tickets than remain (no overselling)
- Cannot buy for a past event
- Max 10 tickets per order
- Cancelling an order releases the tickets and excludes it from revenue
- Capacity can't be lowered below tickets already sold

## Project structure

```
backend/
  app/
    main.py       FastAPI app + routes
    models.py     SQLAlchemy models (Event, Order)
    schemas.py    Pydantic schemas
    crud.py       DB operations, purchase logic, stats
    database.py   Engine / session
    seed.py       Sample events
  requirements.txt
frontend/
  src/
    pages/        Events, EventDetail, Confirmation, MyOrders, Admin
    components/   EventCard
    api.js        API client
    App.jsx       Routes + layout
```

## Running locally

### 1. Backend (port 8000)

```bash
cd backend
python3 -m pip install -r requirements.txt
python3 -m uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 2. Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api/*` to the backend, so open
http://localhost:5173

## API overview

| Method | Path                          | Description                       |
| ------ | ----------------------------- | --------------------------------- |
| GET    | `/api/events`                 | List events (search/category/city)|
| POST   | `/api/events`                 | Create an event (organizer)       |
| GET    | `/api/events/{id}`            | Event detail                      |
| PATCH  | `/api/events/{id}`            | Update an event                   |
| DELETE | `/api/events/{id}`            | Delete an event                   |
| GET    | `/api/events/stats`           | Organizer dashboard stats         |
| POST   | `/api/orders`                 | Buy tickets                       |
| GET    | `/api/orders?email=`          | Look up orders by email           |
| GET    | `/api/orders/{code}`          | Look up an order by reference     |
| POST   | `/api/orders/{code}/cancel`   | Cancel an order                   |
