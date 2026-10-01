"""
SafeCrowd - Real-time Video Stream Worker
Runs YOLO + ByteTrack perception & analytics tier and broadcasts events to connected clients.
"""

import asyncio
import json
import logging
import math
import os
from datetime import datetime
from typing import Dict, List, Optional, Set, Tuple
import cv2
import numpy as np
from fastapi import WebSocket

from ml.tracking.tracker import ByteTrackPipeline
from ml.analytics.metrics import (
    compute_density,
    compute_spatial_heatmap,
    compute_flow_vector,
    compute_velocity_variance,
    compute_flow_turbulence,
)
from ml.analytics.anomaly import detect_anomaly

logger = logging.getLogger("safecrowd.stream_worker")

class StreamWorker:
    def __init__(self):
        self.connected_clients: Set[WebSocket] = set()
        self.tracker: Optional[ByteTrackPipeline] = None
        self.track_history: Dict[int, List[Tuple[float, float]]] = {}
        self.max_history = 15
        self.is_running = False

    def add_client(self, ws: WebSocket):
        self.connected_clients.add(ws)
        logger.info(f"Client connected. Active clients: {len(self.connected_clients)}")

    def remove_client(self, ws: WebSocket):
        self.connected_clients.discard(ws)
        logger.info(f"Client disconnected. Active clients: {len(self.connected_clients)}")

    def _ensure_tracker(self):
        if self.tracker is None:
            weights = "ml/detection/weights/best.pt"
            if not os.path.exists(weights):
                weights = "backend/models/best.pt"
            self.tracker = ByteTrackPipeline(weights_path=weights, imgsz=640)

    async def broadcast_payload(self, payload: dict):
        if not self.connected_clients:
            return

        msg = json.dumps(payload)
        dead = set()
        for client in list(self.connected_clients):
            try:
                await client.send_text(msg)
            except Exception:
                dead.add(client)
        self.connected_clients.difference_update(dead)

    async def run_pipeline_loop(self, video_path: str = "frontend/public/12269404_2320_1080_30fps.mp4"):
        """Continuous background worker running inference on video stream."""
        self._ensure_tracker()
        cap = cv2.VideoCapture(video_path)
        frame_idx = 0

        logger.info(f"StreamWorker started processing: {video_path}")
        self.is_running = True

        while self.is_running:
            if not self.connected_clients:
                await asyncio.sleep(0.5)
                continue

            ret, frame = cap.read()
            if not ret:
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                await asyncio.sleep(0.01)
                continue

            frame_idx += 1
            now_iso = datetime.utcnow().isoformat() + "Z"
            now_ts = asyncio.get_event_loop().time()

            # Resize frame for optimal inference speed
            h, w = frame.shape[:2]
            frame_resized = cv2.resize(frame, (960, 540))
            rh, rw = frame_resized.shape[:2]

            trajectories, _ = self.tracker.track_frame(
                frame_resized, frame_idx=frame_idx, timestamp=now_ts
            )

            headcount = len(trajectories)
            bboxes = [t["bbox"] for t in trajectories]
            active_ids = {t["track_id"] for t in trajectories}
            velocities: List[Tuple[float, float]] = []

            for t in trajectories:
                tid = t["track_id"]
                cx, cy = t["center"]
                if tid not in self.track_history:
                    self.track_history[tid] = []
                self.track_history[tid].append((cx, cy))
                if len(self.track_history[tid]) > self.max_history:
                    self.track_history[tid].pop(0)

                if len(self.track_history[tid]) >= 2:
                    p_old = self.track_history[tid][0]
                    p_new = self.track_history[tid][-1]
                    dx = p_new[0] - p_old[0]
                    dy = p_new[1] - p_old[1]
                    velocities.append((dx, dy))

            # Prune aged tracks
            for tid in list(self.track_history.keys()):
                if tid not in active_ids:
                    self.track_history[tid].pop(0)
                    if not self.track_history[tid]:
                        del self.track_history[tid]

            # Compute mathematical analytics metrics
            density_val = compute_density(headcount, area_sq_m=50.0)
            flow_vec = compute_flow_vector(velocities)
            vel_variance = compute_velocity_variance(velocities)
            turbulence = compute_flow_turbulence(velocities)
            heatmap = compute_spatial_heatmap(bboxes, rw, rh, grid_size=5)

            speeds = [math.sqrt(v[0]**2 + v[1]**2) for v in velocities]
            avg_speed = round(float(np.mean(speeds)), 2) if speeds else 0.0

            # Evaluate PRD-compliant anomaly rules
            is_anomaly, event_type, severity = detect_anomaly(
                density=density_val,
                avg_speed=avg_speed,
                velocity_variance=vel_variance,
                turbulence=turbulence,
            )

            # Build standardized payload matching schema.md (with compatibility attributes)
            payload = {
                "camera_id": "cam-001",
                "zone_id": "zone-001",
                "event_type": event_type or "normal",
                "severity": severity or 1,
                "detected_at": now_iso,
                "metrics": {
                    "density": density_val,
                    "flow_vector": list(flow_vec),
                    "velocity_variance": vel_variance,
                    "headcount": headcount,
                    "avg_speed": avg_speed,
                    "heatmap": heatmap,
                },
                "snapshot_url": "/12269404_2320_1080_30fps.mp4",
                # Convenience camelCase mappings for dashboard
                "cameraId": "cam-001",
                "zoneName": "Main Entrance Gate",
                "headcount": headcount,
                "density": "critical" if density_val >= 5.0 else "high" if density_val >= 3.0 else "moderate" if density_val >= 1.5 else "low",
                "flowDirection": round((math.degrees(math.atan2(flow_vec[1], flow_vec[0])) + 360) % 360, 1) if (flow_vec[0] or flow_vec[1]) else 0.0,
                "avgSpeed": avg_speed,
                "heatmap": heatmap,
                "anomaly": is_anomaly,
                "anomalyType": event_type,
                "timestamp": now_iso,
            }

            await self.broadcast_payload(payload)
            await asyncio.sleep(0.1)  # 10 fps telemetry broadcast

stream_worker = StreamWorker()
