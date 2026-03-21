from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.database import connect_db, close_db
from app.routes.drones import router as drones_router
from app.routes.incidents import router as incidents_router
from app.routes.tasks import router as tasks_router
from app.routes.alarms import router as alarms_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(title="AeroGuard Durango API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(drones_router)
app.include_router(incidents_router)
app.include_router(tasks_router)
app.include_router(alarms_router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
