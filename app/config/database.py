from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config.settings import settings

_client: AsyncIOMotorClient = None


async def connect_db() -> None:
    global _client
    _client = AsyncIOMotorClient(settings.mongodb_url)
    db = _client[settings.mongodb_db_name]

    try:
        await db.drones.create_index("id", unique=True)
    except Exception:
        pass
    try:
        await db.incidents.create_index("incidentId", unique=True)
    except Exception:
        pass
    try:
        await db.tasks.create_index("taskId", unique=True)
    except Exception:
        pass
    try:
        await db.alarms.create_index("id", unique=True)
    except Exception:
        pass

    print(f"Connected to MongoDB - database: {settings.mongodb_db_name}")


async def close_db() -> None:
    global _client
    if _client:
        _client.close()


def get_db() -> AsyncIOMotorDatabase:
    return _client[settings.mongodb_db_name]
