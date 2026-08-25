from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


# ---------- User ----------
class UserBase(BaseModel):
    name: str
    email: str
    role: str = "agent"


class UserCreate(UserBase):
    pass


class User(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


# ---------- Comment ----------
class CommentBase(BaseModel):
    author: str
    body: str


class CommentCreate(CommentBase):
    pass


class Comment(CommentBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    ticket_id: int
    created_at: datetime


# ---------- Ticket ----------
class TicketBase(BaseModel):
    title: str
    description: str = ""
    priority: str = "medium"
    category: str = "general"
    requester_name: str
    requester_email: str


class TicketCreate(TicketBase):
    assignee_id: Optional[int] = None


class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    assignee_id: Optional[int] = None


class Ticket(TicketBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status: str
    assignee_id: Optional[int] = None
    assignee: Optional[User] = None
    created_at: datetime
    updated_at: datetime
    comments: List[Comment] = []


class TicketSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    status: str
    priority: str
    category: str
    requester_name: str
    assignee: Optional[User] = None
    created_at: datetime
    updated_at: datetime


class Stats(BaseModel):
    total: int
    open: int
    in_progress: int
    resolved: int
    closed: int
    by_priority: dict
    unassigned: int
