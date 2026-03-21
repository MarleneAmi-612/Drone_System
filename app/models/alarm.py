from typing import Literal
from pydantic import BaseModel


class AlarmCreate(BaseModel):
    droneId: str
    type: str
    timestamp: int
    status: Literal["ACTIVE", "RESOLVED"] = "ACTIVE"
    details: str = ""


class AlarmResponse(BaseModel):
    id: str
    droneId: str
    type: str
    timestamp: int
    status: Literal["ACTIVE", "RESOLVED"]
    details: str
