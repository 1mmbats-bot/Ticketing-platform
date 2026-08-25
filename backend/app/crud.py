from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from . import models, schemas

VALID_STATUS = {"open", "in_progress", "resolved", "closed"}
VALID_PRIORITY = {"low", "medium", "high", "urgent"}


# ---------- Users ----------
def get_users(db: Session):
    return db.query(models.User).order_by(models.User.name).all()


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# ---------- Tickets ----------
def get_tickets(
    db: Session,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assignee_id: Optional[int] = None,
    search: Optional[str] = None,
):
    q = db.query(models.Ticket)
    if status:
        q = q.filter(models.Ticket.status == status)
    if priority:
        q = q.filter(models.Ticket.priority == priority)
    if assignee_id is not None:
        q = q.filter(models.Ticket.assignee_id == assignee_id)
    if search:
        like = f"%{search}%"
        q = q.filter(
            models.Ticket.title.ilike(like) | models.Ticket.description.ilike(like)
        )
    return q.order_by(models.Ticket.updated_at.desc()).all()


def get_ticket(db: Session, ticket_id: int):
    return db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()


def create_ticket(db: Session, ticket: schemas.TicketCreate):
    db_ticket = models.Ticket(**ticket.model_dump())
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def update_ticket(db: Session, db_ticket: models.Ticket, updates: schemas.TicketUpdate):
    data = updates.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(db_ticket, field, value)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def delete_ticket(db: Session, db_ticket: models.Ticket):
    db.delete(db_ticket)
    db.commit()


def add_comment(db: Session, ticket_id: int, comment: schemas.CommentCreate):
    db_comment = models.Comment(ticket_id=ticket_id, **comment.model_dump())
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


def get_stats(db: Session):
    total = db.query(func.count(models.Ticket.id)).scalar() or 0

    status_rows = (
        db.query(models.Ticket.status, func.count(models.Ticket.id))
        .group_by(models.Ticket.status)
        .all()
    )
    status_counts = {s: c for s, c in status_rows}

    priority_rows = (
        db.query(models.Ticket.priority, func.count(models.Ticket.id))
        .group_by(models.Ticket.priority)
        .all()
    )
    by_priority = {p: c for p, c in priority_rows}

    unassigned = (
        db.query(func.count(models.Ticket.id))
        .filter(models.Ticket.assignee_id.is_(None))
        .scalar()
        or 0
    )

    return schemas.Stats(
        total=total,
        open=status_counts.get("open", 0),
        in_progress=status_counts.get("in_progress", 0),
        resolved=status_counts.get("resolved", 0),
        closed=status_counts.get("closed", 0),
        by_priority={p: by_priority.get(p, 0) for p in VALID_PRIORITY},
        unassigned=unassigned,
    )
