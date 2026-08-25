from typing import List, Optional

from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import config, crud, notifications, schemas
from .crud import BusinessError
from .database import Base, engine, get_db
from .seed import seed_if_empty

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Event Ticketing API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup():
    seed_if_empty()


@app.get("/api/health")
def health():
    return {"status": "ok", "telegram_configured": config.TELEGRAM_ENABLED}


@app.post("/api/notifications/test")
def test_telegram():
    ok, detail = notifications.send_telegram_message(
        "✅ TicketHub test message — your Telegram notifications are working!"
    )
    if not ok:
        raise HTTPException(status_code=400, detail=detail)
    return {"ok": True, "detail": detail}


# ---------- Events ----------
@app.get("/api/events", response_model=List[schemas.Event])
def list_events(
    search: Optional[str] = Query(None),
    category: Optional[str] = None,
    city: Optional[str] = None,
    upcoming_only: bool = False,
    db: Session = Depends(get_db),
):
    return crud.get_events(db, search, category, city, upcoming_only)


@app.get("/api/events/stats", response_model=schemas.Stats)
def event_stats(db: Session = Depends(get_db)):
    return crud.get_stats(db)


@app.get("/api/events/{event_id}", response_model=schemas.Event)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = crud.get_event(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@app.post("/api/events", response_model=schemas.Event, status_code=201)
def create_event(event: schemas.EventCreate, db: Session = Depends(get_db)):
    if event.price_cents < 0:
        raise HTTPException(status_code=400, detail="Price cannot be negative")
    if event.capacity < 0:
        raise HTTPException(status_code=400, detail="Capacity cannot be negative")
    return crud.create_event(db, event)


@app.patch("/api/events/{event_id}", response_model=schemas.Event)
def update_event(
    event_id: int, updates: schemas.EventUpdate, db: Session = Depends(get_db)
):
    event = crud.get_event(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    try:
        return crud.update_event(db, event, updates)
    except BusinessError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/api/events/{event_id}", status_code=204)
def delete_event(event_id: int, db: Session = Depends(get_db)):
    event = crud.get_event(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    crud.delete_event(db, event)


# ---------- Orders ----------
@app.post("/api/orders", response_model=schemas.Order, status_code=201)
def create_order(
    order: schemas.OrderCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    try:
        db_order = crud.create_order(db, order)
    except BusinessError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Build the message now (session is open), send it after the response.
    event = crud.get_event(db, db_order.event_id)
    message = notifications.build_order_message(db_order, event)
    background_tasks.add_task(notifications.send_telegram_message, message)
    return db_order


@app.patch("/api/orders/{code}", response_model=schemas.Order)
def update_order(code: str, updates: schemas.OrderUpdate, db: Session = Depends(get_db)):
    order = crud.get_order_by_code(db, code)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if updates.payment_status is not None:
        try:
            crud.set_payment_status(db, order, updates.payment_status)
        except BusinessError as e:
            raise HTTPException(status_code=400, detail=str(e))
    return order


@app.get("/api/orders", response_model=List[schemas.Order])
def list_orders(email: Optional[str] = None, db: Session = Depends(get_db)):
    return crud.get_orders(db, email)


@app.get("/api/orders/{code}", response_model=schemas.Order)
def get_order(code: str, db: Session = Depends(get_db)):
    order = crud.get_order_by_code(db, code)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@app.post("/api/orders/{code}/cancel", response_model=schemas.Order)
def cancel_order(code: str, db: Session = Depends(get_db)):
    order = crud.get_order_by_code(db, code)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    try:
        return crud.cancel_order(db, order)
    except BusinessError as e:
        raise HTTPException(status_code=400, detail=str(e))
