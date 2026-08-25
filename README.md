# TicketHub — Event Ticketing Platform

A full-stack platform where people **buy tickets for events** (concerts, sports,
theater, conferences, comedy). Attendees browse events, go through a **checkout**
where they pick their **payment platform** (M-Pesa, Airtel Money, Card, PayPal,
Bank Transfer), and get a booking reference. Every new order is **saved to the
database** and **sent to your Telegram** instantly. Organizers manage events and
confirm payments from an admin dashboard.

- **Backend:** Python · FastAPI · SQLAlchemy · SQLite
- **Frontend:** React · Vite · React Router

---

## Table of contents
1. [Quick start](#quick-start)
2. [Using the backend](#using-the-backend)
3. [Setting up Telegram notifications](#setting-up-telegram-notifications)
4. [How checkout & payments work](#how-checkout--payments-work)
5. [Manipulating the database](#manipulating-the-database)
6. [API reference](#api-reference)

---

## Quick start

### 1. Backend (port 8000)
```bash
cd backend
python3 -m pip install -r requirements.txt
python3 -m uvicorn app.main:app --reload --port 8000
```
Interactive API docs: http://localhost:8000/docs

### 2. Frontend (port 5173)
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173 — the Vite dev server proxies `/api/*` to the backend.

---

## Using the backend

The backend is a FastAPI app in `backend/app/`:

| File | Responsibility |
| ---- | -------------- |
| `main.py` | HTTP routes (events, orders, notifications) |
| `models.py` | SQLAlchemy tables: `Event`, `Order` |
| `schemas.py` | Pydantic request/response shapes |
| `crud.py` | DB queries + business rules (no overselling, etc.) |
| `database.py` | SQLite engine & session |
| `seed.py` | Sample events on first run |
| `config.py` | Loads `.env` (Telegram settings) |
| `notifications.py` | Sends Telegram messages (stdlib only) |

### Common tasks

**Run it:**
```bash
python3 -m uvicorn app.main:app --reload --port 8000
```
`--reload` restarts automatically when you edit a file.

**Try the API from the terminal:**
```bash
# list events
curl http://localhost:8000/api/events

# create an event
curl -X POST http://localhost:8000/api/events \
  -H 'Content-Type: application/json' \
  -d '{"title":"My Gig","venue":"The Hall","city":"Nairobi",
       "starts_at":"2026-12-01T20:00:00","price_cents":3000,"capacity":100}'

# buy a ticket
curl -X POST http://localhost:8000/api/orders \
  -H 'Content-Type: application/json' \
  -d '{"event_id":1,"customer_name":"Jane","customer_email":"jane@x.com",
       "phone":"+254700000000","quantity":2,
       "payment_method":"mpesa","payment_reference":"+254700000000"}'
```

**Prices are stored in cents** (integers) to avoid floating-point money bugs.
`price_cents: 3000` = $30.00. The frontend converts for display.

**Reset all data** (deletes every event and order): stop the server, then
```bash
rm backend/ticketing.db
```
It is recreated with the sample events next time you start the server.

---

## Setting up Telegram notifications

When someone places an order, the backend sends you a Telegram message like:

```
🎟️ New ticket order
Event: Midnight Synth — Live in Concert
Qty: 2   Total: $90.00
Buyer: Jane
Email: jane@x.com
Phone: +254700000000
Pay via: mpesa
Payment ref: +254700000000
Payment status: pending
Booking code: TKT-1C5147
```

### Steps

1. **Create a bot.** In Telegram, message **@BotFather**, send `/newbot`, and
   follow the prompts. It gives you a **bot token** like
   `123456789:AAExample...`.

2. **Get your chat id.** Send any message to your new bot (e.g. "hi"), then open
   this URL in a browser (replace `<TOKEN>`):
   ```
   https://api.telegram.org/bot<TOKEN>/getUpdates
   ```
   Find `"chat":{"id":123456789,...}` — that number is your **chat id**.

3. **Create `backend/.env`** (copy from the example):
   ```bash
   cp backend/.env.example backend/.env
   ```
   Fill in:
   ```
   TELEGRAM_BOT_TOKEN=123456789:AAExample...
   TELEGRAM_CHAT_ID=123456789
   ```
   `.env` is git-ignored, so your token stays private.

4. **Restart the backend** and test:
   ```bash
   curl -X POST http://localhost:8000/api/notifications/test
   ```
   You should receive a test message. `GET /api/health` also reports
   `"telegram_configured": true` once set up.

If Telegram is **not** configured, orders still work normally — the notification
is simply skipped (nothing breaks).

---

## How checkout & payments work

The **Checkout page** (`/checkout/:id`) collects the buyer's name, email, phone,
quantity, and **payment platform**. Each platform shows tailored instructions and
a reference field (e.g. the M-Pesa phone number, PayPal email, or bank txn code).

On submit, the order is created with `payment_status = "pending"`, tickets are
reserved, and you get the Telegram alert. In the **Admin** dashboard you review
the order and click **Mark paid** once you've confirmed the money arrived.

> ⚠️ **Important:** this records the buyer's chosen method and reference — it does
> **not** actually charge a card or mobile wallet. Real charging requires a
> payment gateway merchant account (e.g. **Stripe**, **Flutterwave**, **Paystack**,
> **Daraja/M-Pesa API**, **PayPal**). Those can be plugged into `create_order` /
> the checkout later. The current flow is "record intent → notify → confirm
> manually", which is a valid way to run sales while you set up a gateway.

---

## Manipulating the database

The database is a single SQLite file: `backend/ticketing.db`. Two tables:
`events` and `orders`. You can edit data any of these ways.

### Option A — the HTTP API (recommended)
Everything is doable via the API / `/docs` page or `curl` (see examples above and
the [API reference](#api-reference)). This keeps business rules enforced.

### Option B — the `sqlite3` CLI
```bash
cd backend
sqlite3 ticketing.db

-- see the schema
.tables
.schema events

-- read data
SELECT id, title, price_cents, capacity, tickets_sold FROM events;
SELECT code, customer_name, payment_method, payment_status FROM orders;

-- update data (remember: price is in cents)
UPDATE events SET price_cents = 5000 WHERE id = 1;
UPDATE orders SET payment_status = 'paid' WHERE code = 'TKT-1C5147';

-- delete data
DELETE FROM orders WHERE id = 3;

.quit
```

### Option C — Python shell (uses the ORM + business rules)
```bash
cd backend
python3
```
```python
from app.database import SessionLocal
from app import models, crud, schemas

db = SessionLocal()

# list events
for e in db.query(models.Event).all():
    print(e.id, e.title, e.tickets_available, "left")

# create an event through the ORM
ev = models.Event(title="Pop-up Show", venue="Loft", city="Austin",
                   starts_at=__import__("datetime").datetime(2026,12,1,20),
                   price_cents=2000, capacity=50)
db.add(ev); db.commit()

# mark an order paid via CRUD helper (validates the status value)
order = crud.get_order_by_code(db, "TKT-1C5147")
crud.set_payment_status(db, order, "paid")

db.close()
```

### Option D — a GUI
Open `backend/ticketing.db` in **DB Browser for SQLite**
(https://sqlitebrowser.org) to browse/edit visually.

### Schema at a glance
```
events                          orders
------                          ------
id            INTEGER PK        id                INTEGER PK
title         TEXT              code              TEXT  (e.g. TKT-1C5147)
description   TEXT              event_id          -> events.id
category      TEXT              customer_name     TEXT
venue         TEXT              customer_email    TEXT
city          TEXT              phone             TEXT
starts_at     DATETIME         quantity          INTEGER
price_cents   INTEGER          total_cents       INTEGER
capacity      INTEGER          payment_method    TEXT (mpesa|airtel|card|paypal|bank)
tickets_sold  INTEGER          payment_reference TEXT
image_url     TEXT             payment_status    TEXT (pending|paid|refunded)
created_at    DATETIME         status            TEXT (confirmed|cancelled)
                                created_at        DATETIME
```

> Note: SQLite's `CREATE TABLE` only runs for missing tables. If you **add a
> column** to a model, delete `ticketing.db` (dev data) or run an `ALTER TABLE`
> so the new column exists.

---

## API reference

### Events
| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/events` | List events. Query: `search`, `category`, `city`, `upcoming_only` |
| POST | `/api/events` | Create an event |
| GET | `/api/events/{id}` | Event detail |
| PATCH | `/api/events/{id}` | Update an event |
| DELETE | `/api/events/{id}` | Delete an event |
| GET | `/api/events/stats` | Dashboard stats (revenue, tickets sold, best sellers) |

### Orders
| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/api/orders` | Buy tickets (also fires Telegram alert) |
| GET | `/api/orders` | List all orders. Query: `email` to filter |
| GET | `/api/orders/{code}` | Look up an order by booking code |
| PATCH | `/api/orders/{code}` | Update payment status (`pending`/`paid`/`refunded`) |
| POST | `/api/orders/{code}/cancel` | Cancel and release tickets |

### Notifications
| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/health` | Health + whether Telegram is configured |
| POST | `/api/notifications/test` | Send a Telegram test message |

### Business rules (enforced server-side)
- No overselling — can't buy more tickets than remain
- Can't buy for a past event; max 10 tickets per order
- Cancelling releases tickets and removes the order from revenue
- Capacity can't be lowered below tickets already sold
- Only known payment methods / statuses are accepted
