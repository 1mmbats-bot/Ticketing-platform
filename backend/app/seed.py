from datetime import datetime, timedelta

from .database import SessionLocal
from . import models


def seed_if_empty():
    db = SessionLocal()
    try:
        if db.query(models.Event).count() > 0:
            return

        now = datetime.utcnow()
        events = [
            models.Event(
                title="Midnight Synth — Live in Concert",
                description="An electrifying night of synthwave with laser visuals and special guests.",
                category="music",
                venue="Neon Arena",
                city="Austin",
                starts_at=now + timedelta(days=14, hours=3),
                price_cents=4500,
                capacity=500,
                tickets_sold=120,
                image_url="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
            ),
            models.Event(
                title="City Marathon 2026",
                description="Run the historic downtown route. Includes race pack and finisher medal.",
                category="sports",
                venue="Downtown Start Line",
                city="Chicago",
                starts_at=now + timedelta(days=40),
                price_cents=6000,
                capacity=2000,
                tickets_sold=1450,
                image_url="https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800",
            ),
            models.Event(
                title="Hamlet — A Modern Retelling",
                description="A bold new staging of Shakespeare's classic tragedy.",
                category="theater",
                venue="Grand Playhouse",
                city="New York",
                starts_at=now + timedelta(days=7, hours=2),
                price_cents=7500,
                capacity=300,
                tickets_sold=295,
                image_url="https://images.unsplash.com/photo-1503095396549-807759245b35?w=800",
            ),
            models.Event(
                title="DevWorld 2026 Conference",
                description="Two days of talks on AI, web, and cloud from industry leaders.",
                category="conference",
                venue="Metro Convention Center",
                city="San Francisco",
                starts_at=now + timedelta(days=60),
                price_cents=29900,
                capacity=1200,
                tickets_sold=800,
                image_url="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
            ),
            models.Event(
                title="Laugh Out Loud — Comedy Night",
                description="Stand-up showcase featuring five rising comedians.",
                category="comedy",
                venue="The Basement Club",
                city="Austin",
                starts_at=now + timedelta(days=3, hours=1),
                price_cents=2500,
                capacity=150,
                tickets_sold=150,  # sold out
                image_url="https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800",
            ),
        ]
        db.add_all(events)
        db.commit()
    finally:
        db.close()
