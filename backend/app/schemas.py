from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


# ---------- Event ----------
class EventBase(BaseModel):
    title: str
    description: str = ""
    category: str = "general"
    venue: str
    city: str
    starts_at: datetime
    price_cents: int = 0
    capacity: int = 0
    image_url: str = ""


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    venue: Optional[str] = None
    city: Optional[str] = None
    starts_at: Optional[datetime] = None
    price_cents: Optional[int] = None
    capacity: Optional[int] = None
    image_url: Optional[str] = None


class Event(EventBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    tickets_sold: int
    tickets_available: int
    created_at: datetime


# ---------- Order ----------
class OrderCreate(BaseModel):
    event_id: int
    customer_name: str
    customer_email: str
    phone: str = ""
    quantity: int
    payment_method: str = "mpesa"
    payment_reference: str = ""


class OrderUpdate(BaseModel):
    payment_status: Optional[str] = None  # pending | paid | refunded


class Order(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    code: str
    event_id: int
    customer_name: str
    customer_email: str
    phone: str = ""
    quantity: int
    total_cents: int
    payment_method: str
    payment_reference: str = ""
    payment_status: str
    status: str
    created_at: datetime
    event: Optional[Event] = None


class Stats(BaseModel):
    total_events: int
    upcoming_events: int
    tickets_sold: int
    revenue_cents: int
    orders: int
    top_events: List[dict]
