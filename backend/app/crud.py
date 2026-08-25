import secrets
from datetime import datetime
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from . import models, schemas

CATEGORIES = {"music", "sports", "theater", "conference", "comedy", "general"}


class BusinessError(Exception):
    """Raised for domain rule violations (turned into HTTP 400)."""


# ---------- Events ----------
def get_events(
    db: Session,
    search: Optional[str] = None,
    category: Optional[str] = None,
    city: Optional[str] = None,
    upcoming_only: bool = False,
):
    q = db.query(models.Event)
    if search:
        like = f"%{search}%"
        q = q.filter(
            models.Event.title.ilike(like) | models.Event.description.ilike(like)
        )
    if category:
        q = q.filter(models.Event.category == category)
    if city:
        q = q.filter(models.Event.city.ilike(f"%{city}%"))
    if upcoming_only:
        q = q.filter(models.Event.starts_at >= datetime.utcnow())
    return q.order_by(models.Event.starts_at.asc()).all()


def get_event(db: Session, event_id: int):
    return db.query(models.Event).filter(models.Event.id == event_id).first()


def create_event(db: Session, event: schemas.EventCreate):
    db_event = models.Event(**event.model_dump())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


def update_event(db: Session, db_event: models.Event, updates: schemas.EventUpdate):
    data = updates.model_dump(exclude_unset=True)
    if "capacity" in data and data["capacity"] < db_event.tickets_sold:
        raise BusinessError("Capacity cannot be less than tickets already sold")
    for field, value in data.items():
        setattr(db_event, field, value)
    db.commit()
    db.refresh(db_event)
    return db_event


def delete_event(db: Session, db_event: models.Event):
    db.delete(db_event)
    db.commit()


# ---------- Orders ----------
def _gen_code() -> str:
    return "TKT-" + secrets.token_hex(3).upper()


def create_order(db: Session, order: schemas.OrderCreate):
    event = get_event(db, order.event_id)
    if not event:
        raise BusinessError("Event not found")
    if order.quantity < 1:
        raise BusinessError("Quantity must be at least 1")
    if order.quantity > 10:
        raise BusinessError("Maximum 10 tickets per order")
    if event.starts_at < datetime.utcnow():
        raise BusinessError("This event has already taken place")
    if order.quantity > event.tickets_available:
        raise BusinessError(
            f"Only {event.tickets_available} ticket(s) left for this event"
        )

    total = order.quantity * event.price_cents
    db_order = models.Order(
        code=_gen_code(),
        event_id=event.id,
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        quantity=order.quantity,
        total_cents=total,
        status="confirmed",
    )
    event.tickets_sold += order.quantity
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


def get_orders(db: Session, email: Optional[str] = None):
    q = db.query(models.Order)
    if email:
        q = q.filter(models.Order.customer_email.ilike(email))
    return q.order_by(models.Order.created_at.desc()).all()


def get_order_by_code(db: Session, code: str):
    return db.query(models.Order).filter(models.Order.code == code.upper()).first()


def cancel_order(db: Session, db_order: models.Order):
    if db_order.status == "cancelled":
        raise BusinessError("Order is already cancelled")
    if db_order.event and db_order.event.starts_at < datetime.utcnow():
        raise BusinessError("Cannot cancel an order for a past event")
    db_order.status = "cancelled"
    if db_order.event:
        db_order.event.tickets_sold = max(
            0, db_order.event.tickets_sold - db_order.quantity
        )
    db.commit()
    db.refresh(db_order)
    return db_order


# ---------- Stats ----------
def get_stats(db: Session):
    total_events = db.query(func.count(models.Event.id)).scalar() or 0
    upcoming = (
        db.query(func.count(models.Event.id))
        .filter(models.Event.starts_at >= datetime.utcnow())
        .scalar()
        or 0
    )

    confirmed = db.query(models.Order).filter(models.Order.status == "confirmed")
    tickets_sold = confirmed.with_entities(
        func.coalesce(func.sum(models.Order.quantity), 0)
    ).scalar() or 0
    revenue = confirmed.with_entities(
        func.coalesce(func.sum(models.Order.total_cents), 0)
    ).scalar() or 0
    order_count = confirmed.count()

    top_rows = (
        db.query(
            models.Event.title,
            func.coalesce(func.sum(models.Order.quantity), 0).label("sold"),
        )
        .join(models.Order, models.Order.event_id == models.Event.id)
        .filter(models.Order.status == "confirmed")
        .group_by(models.Event.id)
        .order_by(func.sum(models.Order.quantity).desc())
        .limit(5)
        .all()
    )
    top_events = [{"title": t, "sold": int(s)} for t, s in top_rows]

    return schemas.Stats(
        total_events=total_events,
        upcoming_events=upcoming,
        tickets_sold=int(tickets_sold),
        revenue_cents=int(revenue),
        orders=order_count,
        top_events=top_events,
    )
