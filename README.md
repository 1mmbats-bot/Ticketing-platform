# HelpDesk — Ticketing Platform

A full-stack support ticketing system: create, assign, prioritize, and comment
on support tickets, with a live stats dashboard.

- **Backend:** Python · FastAPI · SQLAlchemy · SQLite
- **Frontend:** React · Vite · React Router

## Features

- Dashboard with ticket counts by status/priority and unassigned count
- Ticket list with search + status/priority filters
- Ticket detail: change status, priority, and assignee inline
- Threaded comments / activity log
- Create and delete tickets
- Seed data on first run (users + sample tickets)

## Project structure

```
backend/
  app/
    main.py       FastAPI app + routes
    models.py     SQLAlchemy models (User, Ticket, Comment)
    schemas.py    Pydantic schemas
    crud.py       DB operations + stats
    database.py   Engine / session
    seed.py       Initial demo data
  requirements.txt
frontend/
  src/
    pages/        Dashboard, TicketList, TicketDetail, NewTicket
    components/   Badges
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

API docs available at http://localhost:8000/docs

### 2. Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api/*` to the backend on port 8000, so just open
http://localhost:5173

## API overview

| Method | Path                          | Description                     |
| ------ | ----------------------------- | ------------------------------- |
| GET    | `/api/tickets`                | List tickets (filters + search) |
| POST   | `/api/tickets`                | Create a ticket                 |
| GET    | `/api/tickets/{id}`           | Ticket detail with comments     |
| PATCH  | `/api/tickets/{id}`           | Update status/priority/assignee |
| DELETE | `/api/tickets/{id}`           | Delete a ticket                 |
| POST   | `/api/tickets/{id}/comments`  | Add a comment                   |
| GET    | `/api/tickets/stats`          | Dashboard statistics            |
| GET    | `/api/users`                  | List agents/users               |
