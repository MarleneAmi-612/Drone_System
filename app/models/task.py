from typing import Literal
from pydantic import BaseModel
from app.models.drone import Position


class TaskCreate(BaseModel):
    id: str
    mission: str
    destination: Position
    priority: Literal["Alta", "Media", "Baja"] = "Media"
    client: str
    timestamp: int


class TaskResponse(BaseModel):
    id: str
    mission: str
    destination: Position
    priority: Literal["Alta", "Media", "Baja"]
    client: str
    timestamp: int
