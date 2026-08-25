from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    category = Column(String, default="general", index=True)
    venue = Column(String, nullable=False)
    city = Column(String, nullable=False)
    starts_at = Column(DateTime, nullable=False)  # event date/time
    price_cents = Column(Integer, nullable=False, default=0)  # price per ticket
    capacity = Column(Integer, nullable=False, default=0)
    tickets_sold = Column(Integer, nullable=False, default=0)
    image_url = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship("Order", back_populates="event", cascade="all, delete-orphan")

    @property
    def tickets_available(self) -> int:
        return max(0, self.capacity - self.tickets_sold)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)  # booking reference
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    customer_name = Column(String, nullable=False)
    customer_email = Column(String, nullable=False)
    phone = Column(String, default="")
    quantity = Column(Integer, nullable=False)
    total_cents = Column(Integer, nullable=False)

    # Payment
    payment_method = Column(String, default="mpesa")  # mpesa|airtel|card|paypal|bank
    payment_reference = Column(String, default="")  # phone / txn code / paypal email
    payment_status = Column(String, default="pending")  # pending | paid | refunded

    status = Column(String, default="confirmed")  # confirmed | cancelled
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="orders")
