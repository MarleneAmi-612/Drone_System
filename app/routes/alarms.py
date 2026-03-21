from fastapi import APIRouter, HTTPException
from app.config.database import get_db
from app.models.alarm import AlarmCreate, AlarmResponse

router = APIRouter(prefix="/api/alarms", tags=["alarms"])


def _serialize(doc: dict) -> dict:
    doc.pop("_id", None)
    return {
        "id": doc.get("id"),
        "droneId": doc.get("droneId"),
        "type": doc.get("type"),
        "timestamp": doc.get("timestamp"),
        "status": doc.get("status"),
        "details": doc.get("details", ""),
    }


@router.get("/", response_model=list[AlarmResponse])
async def list_alarms(status: str | None = None):
    db = get_db()
    query = {"status": status} if status else {}
    records = await db.alarms.find(query).sort("timestamp", -1).to_list(length=None)
    return [_serialize(r) for r in records]


@router.post("/", response_model=AlarmResponse, status_code=201)
async def create_alarm(body: AlarmCreate):
    db = get_db()
    doc_id = f"ALM-{body.droneId}-{body.timestamp}"
    existing = await db.alarms.find_one({"id": doc_id})
    if existing:
        return _serialize(existing)
    doc = {
        "id": doc_id,
        "droneId": body.droneId,
        "type": body.type,
        "timestamp": body.timestamp,
        "status": body.status,
        "details": body.details,
    }
    await db.alarms.insert_one(doc)
    return _serialize(doc)


@router.patch("/{alarm_id}/resolve", response_model=AlarmResponse)
async def resolve_alarm(alarm_id: str):
    db = get_db()
    result = await db.alarms.find_one_and_update(
        {"id": alarm_id},
        {"$set": {"status": "RESOLVED"}},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Alarm not found")
    return _serialize(result)


@router.patch("/resolve-by-drone/{drone_id}")
async def resolve_alarms_by_drone(drone_id: str):
    db = get_db()
    await db.alarms.update_many(
        {"droneId": drone_id, "status": "ACTIVE"},
        {"$set": {"status": "RESOLVED"}},
    )
    return {"message": f"Alarms for drone {drone_id} resolved"}


@router.delete("/{alarm_id}")
async def delete_alarm(alarm_id: str):
    db = get_db()
    result = await db.alarms.find_one_and_delete({"id": alarm_id})
    if not result:
        raise HTTPException(status_code=404, detail="Alarm not found")
    return {"message": f"Alarm {alarm_id} deleted"}
