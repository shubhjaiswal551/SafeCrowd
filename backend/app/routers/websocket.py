"""
SafeCrowd - WebSocket Broadcaster Router
Handles real-time metric & alert streaming to connected frontend clients.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..services.stream_worker import stream_worker

router = APIRouter(tags=["WebSocket"])

@router.websocket("/ws/crowd-feed")
async def websocket_crowd_feed(websocket: WebSocket):
    await websocket.accept()
    stream_worker.add_client(websocket)
    try:
        while True:
            # Keep connection open and listen for any client messages/pings
            await websocket.receive_text()
    except WebSocketDisconnect:
        stream_worker.remove_client(websocket)
    except Exception:
        stream_worker.remove_client(websocket)

@router.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await websocket.accept()
    stream_worker.add_client(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        stream_worker.remove_client(websocket)
    except Exception:
        stream_worker.remove_client(websocket)
