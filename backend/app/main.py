from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import Base, engine, get_db
from .seed import seed_if_empty

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ticketing Platform API", version="1.0.0")

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
    return {"status": "ok"}


# ---------- Users ----------
@app.get("/api/users", response_model=List[schemas.User])
def list_users(db: Session = Depends(get_db)):
    return crud.get_users(db)


@app.post("/api/users", response_model=schemas.User, status_code=201)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db, user)


# ---------- Tickets ----------
@app.get("/api/tickets", response_model=List[schemas.TicketSummary])
def list_tickets(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assignee_id: Optional[int] = None,
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return crud.get_tickets(db, status, priority, assignee_id, search)


@app.get("/api/tickets/stats", response_model=schemas.Stats)
def ticket_stats(db: Session = Depends(get_db)):
    return crud.get_stats(db)


@app.get("/api/tickets/{ticket_id}", response_model=schemas.Ticket)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = crud.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@app.post("/api/tickets", response_model=schemas.Ticket, status_code=201)
def create_ticket(ticket: schemas.TicketCreate, db: Session = Depends(get_db)):
    if ticket.priority not in crud.VALID_PRIORITY:
        raise HTTPException(status_code=400, detail="Invalid priority")
    if ticket.assignee_id is not None and not crud.get_user(db, ticket.assignee_id):
        raise HTTPException(status_code=400, detail="Assignee not found")
    return crud.create_ticket(db, ticket)


@app.patch("/api/tickets/{ticket_id}", response_model=schemas.Ticket)
def update_ticket(
    ticket_id: int, updates: schemas.TicketUpdate, db: Session = Depends(get_db)
):
    ticket = crud.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if updates.status is not None and updates.status not in crud.VALID_STATUS:
        raise HTTPException(status_code=400, detail="Invalid status")
    if updates.priority is not None and updates.priority not in crud.VALID_PRIORITY:
        raise HTTPException(status_code=400, detail="Invalid priority")
    if updates.assignee_id is not None and not crud.get_user(db, updates.assignee_id):
        raise HTTPException(status_code=400, detail="Assignee not found")
    return crud.update_ticket(db, ticket, updates)


@app.delete("/api/tickets/{ticket_id}", status_code=204)
def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = crud.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    crud.delete_ticket(db, ticket)


@app.post("/api/tickets/{ticket_id}/comments", response_model=schemas.Comment, status_code=201)
def add_comment(
    ticket_id: int, comment: schemas.CommentCreate, db: Session = Depends(get_db)
):
    ticket = crud.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return crud.add_comment(db, ticket_id, comment)
