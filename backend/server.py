"""
SafeCrowd - Real-time Streaming Server
Streams Stage 2 tracking metrics and video frames via WebSockets directly to the React dashboard.
"""

import asyncio
import base64
import json
import time
from datetime import datetime
from typing import Set
import cv2
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from stage2_tracker import SafeCrowdTracker

app = FastAPI(title="SafeCrowd Analytics & Perception API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

connected_clients: Set[WebSocket] = set()

# Initialize trackers for the 2 demo zones
tracker_cam1 = SafeCrowdTracker(weights_path="backend/models/best.pt", imgsz=640)

@app.websocket("/ws/crowd-feed")
async def websocket_crowd_feed(websocket: WebSocket):
    await websocket.accept()
    connected_clients.add(websocket)
    print(f"[WebSocket] Client connected. Total clients: {len(connected_clients)}")
    try:
        while True:
            # Keep socket open and listen for any incoming client commands
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        connected_clients.remove(websocket)
        print(f"[WebSocket] Client disconnected. Total clients: {len(connected_clients)}")

async def broadcast_camera_feed(source_path: str = "frontend/public/12269404_2320_1080_30fps.mp4"):
    """Background worker that runs inference and broadcasts metrics to dashboard clients."""
    cap = cv2.VideoCapture(source_path)
    
    while True:
        if not connected_clients:
            await asyncio.sleep(0.5)
            continue

        ret, frame = cap.read()
        if not ret:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            await asyncio.sleep(0.01)
            continue

        # Resize for fast processing if necessary
        frame_resized = cv2.resize(frame, (960, 540))
        
        # Run Stage 2 tracker
        result = tracker_cam1.process_frame(
            frame_resized,
            camera_id="cam-01",
            zone_name="Main Entrance Gate"
        )

        # Build payload matching frontend CrowdEvent schema
        payload = {
            "cameraId": result["cameraId"],
            "zoneName": result["zoneName"],
            "headcount": result["headcount"],
            "density": result["density"],
            "flowDirection": result["flowDirection"],
            "avgSpeed": result["avgSpeed"],
            "heatmap": result["heatmap"],
            "anomaly": result["anomaly"],
            "anomalyType": result["anomalyType"],
            "severity": result["severity"],
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }

        # Broadcast to all connected frontend clients
        dead_clients = set()
        for client in connected_clients:
            try:
                await client.send_text(json.dumps(payload))
            except Exception:
                dead_clients.add(client)
        
        connected_clients.difference_update(dead_clients)
        await asyncio.sleep(0.1)  # ~10 updates / sec

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(broadcast_camera_feed())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=False)
