from typing import Literal
from pydantic import BaseModel


class IncidentCreate(BaseModel):
    id: str
    droneId: str
    type: str
    timestamp: int
    status: Literal["ACTIVE", "RESOLVED"] = "ACTIVE"
    details: str = ""


class IncidentResponse(BaseModel):
    id: str
    droneId: str
    type: str
    timestamp: int
    status: Literal["ACTIVE", "RESOLVED"]
    details: str
