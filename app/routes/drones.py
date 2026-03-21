from fastapi import APIRouter, HTTPException
from app.config.database import get_db
from app.models.drone import DroneCreate, DroneUpdate, DroneResponse

router = APIRouter(prefix="/api/drones", tags=["drones"])


def _serialize(doc: dict) -> dict:
    doc.pop("_id", None)
    doc.pop("simulationType", None)
    doc.pop("incidentCounter", None)
    doc.pop("deviationCounter", None)
    return doc


@router.get("/", response_model=list[DroneResponse])
async def list_drones():
    db = get_db()
    drones = await db.drones.find().to_list(length=None)
    return [_serialize(d) for d in drones]


@router.get("/{drone_id}", response_model=DroneResponse)
async def get_drone(drone_id: str):
    db = get_db()
    drone = await db.drones.find_one({"id": drone_id})
    if not drone:
        raise HTTPException(status_code=404, detail="Drone not found")
    return _serialize(drone)


@router.post("/", response_model=DroneResponse, status_code=201)
async def create_drone(body: DroneCreate):
    db = get_db()
    existing = await db.drones.find_one({"id": body.id})
    if existing:
        raise HTTPException(status_code=409, detail=f"Drone {body.id} already exists")
    doc = body.model_dump()
    await db.drones.insert_one(doc)
    return _serialize(doc)


@router.put("/{drone_id}", response_model=DroneResponse)
async def replace_drone(drone_id: str, body: DroneCreate):
    db = get_db()
    doc = body.model_dump()
    result = await db.drones.find_one_and_replace(
        {"id": drone_id}, doc, return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Drone not found")
    return _serialize(result)


@router.patch("/{drone_id}", response_model=DroneResponse)
async def patch_drone(drone_id: str, body: DroneUpdate):
    db = get_db()
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.drones.find_one_and_update(
        {"id": drone_id}, {"$set": updates}, return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Drone not found")
    return _serialize(result)


@router.delete("/{drone_id}")
async def delete_drone(drone_id: str):
    db = get_db()
    result = await db.drones.find_one_and_delete({"id": drone_id})
    if not result:
        raise HTTPException(status_code=404, detail="Drone not found")
    return {"message": f"Drone {drone_id} deleted"}
