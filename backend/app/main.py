"""
SafeCrowd - FastAPI Backend Application
Modular resource routers, Pydantic validation, and real-time WebSocket broadcaster.
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import auth, cameras, zones, incidents, websocket
from .services.stream_worker import stream_worker

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("safecrowd.backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Launch video inference pipeline in background
    logger.info("Starting SafeCrowd analytics background worker...")
    task = asyncio.create_task(stream_worker.run_pipeline_loop())
    yield
    # Shutdown: Stop worker gracefully
    logger.info("Shutting down SafeCrowd analytics background worker...")
    stream_worker.is_running = False
    task.cancel()

app = FastAPI(
    title="SafeCrowd Analytics & Alerting API",
    description="Real-Time Crowd Anomaly Detection, Triage, and Video Intelligence Service",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register resource routers
app.include_router(auth.router)
app.include_router(cameras.router)
app.include_router(zones.router)
app.include_router(incidents.router)
app.include_router(websocket.router)

@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "service": "safecrowd-backend",
        "clients_connected": len(stream_worker.connected_clients),
    }
