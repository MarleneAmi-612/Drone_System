from typing import Optional
from pydantic import BaseModel, Field


class Position(BaseModel):
    x: float
    y: float


class DroneBase(BaseModel):
    id: str
    model: str
    status: str = "Base"
    battery: float = 100
    speed: float = 0
    altitude: float = 0
    position: Position = Field(default_factory=lambda: Position(x=500, y=500))
    destination: Optional[Position] = None
    mission: str = "Standby"
    client: str = "Base Central"
    incidentType: Optional[str] = None
    waypointIndex: Optional[int] = 0
    originalDestination: Optional[Position] = None
    lowBatteryTime: Optional[float] = None
    chargingTime: Optional[float] = None


class DroneCreate(DroneBase):
    pass


class DroneUpdate(BaseModel):
    model: Optional[str] = None
    status: Optional[str] = None
    battery: Optional[float] = None
    speed: Optional[float] = None
    altitude: Optional[float] = None
    position: Optional[Position] = None
    destination: Optional[Position] = None
    mission: Optional[str] = None
    client: Optional[str] = None
    incidentType: Optional[str] = None
    waypointIndex: Optional[int] = None
    originalDestination: Optional[Position] = None
    lowBatteryTime: Optional[float] = None
    chargingTime: Optional[float] = None


class DroneResponse(DroneBase):
    pass
