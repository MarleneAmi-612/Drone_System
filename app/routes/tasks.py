from fastapi import APIRouter, HTTPException
from app.config.database import get_db
from app.models.task import TaskCreate, TaskResponse

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def _serialize(doc: dict) -> dict:
    doc.pop("_id", None)
    return {
        "id": doc.get("taskId"),
        "mission": doc.get("mission"),
        "destination": doc.get("destination"),
        "priority": doc.get("priority"),
        "client": doc.get("client"),
        "timestamp": doc.get("timestamp"),
    }


@router.get("/", response_model=list[TaskResponse])
async def list_tasks():
    db = get_db()
    tasks = await db.tasks.find().sort("timestamp", -1).to_list(length=None)
    return [_serialize(t) for t in tasks]


@router.post("/", response_model=TaskResponse, status_code=201)
async def create_task(body: TaskCreate):
    db = get_db()
    existing = await db.tasks.find_one({"taskId": body.id})
    if existing:
        return _serialize(existing)
    doc = {
        "taskId": body.id,
        "mission": body.mission,
        "destination": body.destination.model_dump(),
        "priority": body.priority,
        "client": body.client,
        "timestamp": body.timestamp,
    }
    await db.tasks.insert_one(doc)
    return _serialize(doc)


@router.delete("/{task_id}")
async def delete_task(task_id: str):
    db = get_db()
    result = await db.tasks.find_one_and_delete({"taskId": task_id})
    if not result:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": f"Task {task_id} deleted"}
