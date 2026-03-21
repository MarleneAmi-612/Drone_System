from fastapi import APIRouter, HTTPException
from app.config.database import get_db
from app.models.incident import IncidentCreate, IncidentResponse

router = APIRouter(prefix="/api/incidents", tags=["incidents"])


def _serialize(doc: dict) -> dict:
    doc.pop("_id", None)
    return {
        "id": doc.get("incidentId"),
        "droneId": doc.get("droneId"),
        "type": doc.get("type"),
        "timestamp": doc.get("timestamp"),
        "status": doc.get("status"),
        "details": doc.get("details", ""),
    }


@router.get("/", response_model=list[IncidentResponse])
async def list_incidents():
    db = get_db()
    records = await db.incidents.find().sort("timestamp", -1).to_list(length=None)
    return [_serialize(r) for r in records]


@router.post("/", response_model=IncidentResponse, status_code=201)
async def create_incident(body: IncidentCreate):
    db = get_db()
    existing = await db.incidents.find_one({"incidentId": body.id})
    if existing:
        return _serialize(existing)
    doc = {
        "incidentId": body.id,
        "droneId": body.droneId,
        "type": body.type,
        "timestamp": body.timestamp,
        "status": body.status,
        "details": body.details,
    }
    await db.incidents.insert_one(doc)
    return _serialize(doc)


@router.patch("/{incident_id}/resolve", response_model=IncidentResponse)
async def resolve_incident(incident_id: str):
    db = get_db()
    result = await db.incidents.find_one_and_update(
        {"incidentId": incident_id},
        {"$set": {"status": "RESOLVED"}},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Incident not found")
    return _serialize(result)


@router.patch("/resolve-by-drone/{drone_id}")
async def resolve_by_drone(drone_id: str):
    db = get_db()
    await db.incidents.update_many(
        {"droneId": drone_id, "status": "ACTIVE"},
        {"$set": {"status": "RESOLVED"}},
    )
    return {"message": f"Active incidents for drone {drone_id} resolved"}


@router.delete("/{incident_id}")
async def delete_incident(incident_id: str):
    db = get_db()
    result = await db.incidents.find_one_and_delete({"incidentId": incident_id})
    if not result:
        raise HTTPException(status_code=404, detail="Incident not found")
    return {"message": f"Incident {incident_id} deleted"}
