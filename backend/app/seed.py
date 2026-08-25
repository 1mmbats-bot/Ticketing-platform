from .database import SessionLocal
from . import models


def seed_if_empty():
    db = SessionLocal()
    try:
        if db.query(models.User).count() > 0:
            return

        users = [
            models.User(name="Alice Nguyen", email="alice@support.io", role="admin"),
            models.User(name="Bob Martins", email="bob@support.io", role="agent"),
            models.User(name="Carla Diaz", email="carla@support.io", role="agent"),
        ]
        db.add_all(users)
        db.commit()
        for u in users:
            db.refresh(u)

        tickets = [
            models.Ticket(
                title="Cannot log in to dashboard",
                description="User reports a 403 error after entering correct credentials.",
                status="open",
                priority="high",
                category="authentication",
                requester_name="Dan Cooper",
                requester_email="dan@acme.com",
                assignee_id=users[1].id,
            ),
            models.Ticket(
                title="Invoice PDF export is blank",
                description="Exported invoices contain no line items for large orders.",
                status="in_progress",
                priority="urgent",
                category="billing",
                requester_name="Ella Fox",
                requester_email="ella@globex.com",
                assignee_id=users[0].id,
            ),
            models.Ticket(
                title="Feature request: dark mode",
                description="Several customers asking for a dark theme option.",
                status="open",
                priority="low",
                category="feature",
                requester_name="Frank Reed",
                requester_email="frank@initech.com",
            ),
            models.Ticket(
                title="API rate limit too aggressive",
                description="Getting 429 responses under normal load.",
                status="resolved",
                priority="medium",
                category="api",
                requester_name="Grace Hill",
                requester_email="grace@umbrella.com",
                assignee_id=users[2].id,
            ),
        ]
        db.add_all(tickets)
        db.commit()
        for t in tickets:
            db.refresh(t)

        db.add_all([
            models.Comment(ticket_id=tickets[0].id, author="Bob Martins",
                           body="Looking into the auth logs now."),
            models.Comment(ticket_id=tickets[1].id, author="Alice Nguyen",
                           body="Reproduced. Seems related to pagination in the PDF renderer."),
        ])
        db.commit()
    finally:
        db.close()
