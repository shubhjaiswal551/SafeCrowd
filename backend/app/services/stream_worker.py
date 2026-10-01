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
from ..routers.incidents import INCIDENTS_DB
from ..routers.cameras import CAMERAS_DB

logger = logging.getLogger("safecrowd.stream_worker")

class StreamWorker:
    def __init__(self):
        self.connected_clients: Set[WebSocket] = set()
        self.tracker: Optional[ByteTrackPipeline] = None
        self.track_history: Dict[int, List[Tuple[float, float]]] = {}
        self.max_history = 15
        self.is_running = False
        self.anomaly_counter: Dict[str, int] = {}
        self.last_incident_time: Dict[str, float] = {}

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

    async def run_pipeline_loop(self):
        """Continuous background worker running inference on both demo camera streams."""
        self._ensure_tracker()
        
        streams = [
            {
                "cameraId": "cam-001",
                "zone_id": "zone-001",
                "zoneName": "Main Entrance Gate",
                "default_path": "frontend/public/12269404_2320_1080_30fps.mp4",
                "area_sq_m": 50.0,
            },
            {
                "cameraId": "cam-002",
                "zone_id": "zone-002",
                "zoneName": "Central Courtyard",
                "default_path": "frontend/public/5287069-sd_960_540_30fps.mp4",
                "area_sq_m": 70.0,
            },
        ]

        caps: Dict[str, cv2.VideoCapture] = {}
        for s in streams:
            cid = s["cameraId"]
            url = CAMERAS_DB.get(cid, {}).get("rtsp_url", s["default_path"])
            caps[cid] = cv2.VideoCapture(url)

        frame_indices = {s["cameraId"]: 0 for s in streams}
        self.is_running = True
        logger.info("StreamWorker initialized multi-camera feeds for cam-001 and cam-002")

        while self.is_running:
            if not self.connected_clients:
                await asyncio.sleep(0.5)
                continue

            for stream in streams:
                cam_key = stream["cameraId"]
                cap = caps[cam_key]

                ret, frame = cap.read()
                if not ret:
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue

                frame_indices[cam_key] += 1
                now_iso = datetime.utcnow().isoformat() + "Z"
                now_ts = asyncio.get_event_loop().time()

                # Optimal resolution for realtime YOLO inference
                frame_resized = cv2.resize(frame, (960, 540))
                rh, rw = frame_resized.shape[:2]

                trajectories, _ = self.tracker.track_frame(
                    frame_resized, frame_idx=frame_indices[cam_key], timestamp=now_ts
                )

                headcount = len(trajectories)
                bboxes = [t["bbox"] for t in trajectories]
                active_ids = {t["track_id"] for t in trajectories}
                velocities: List[Tuple[float, float]] = []

                for t in trajectories:
                    tid = f"{cam_key}_{t['track_id']}"
                    cx, cy = t["center"]
                    if tid not in self.track_history:
                        self.track_history[tid] = []
                    self.track_history[tid].append((cx, cy))
                    if len(self.track_history[tid]) > self.max_history:
                        self.track_history[tid].pop(0)

                    if len(self.track_history[tid]) >= 2:
                        p_old = self.track_history[tid][0]
                        p_new = self.track_history[tid][-1]
                        velocities.append((p_new[0] - p_old[0], p_new[1] - p_old[1]))

                # Prune aged tracks
                for tid in list(self.track_history.keys()):
                    if tid.startswith(cam_key) and int(tid.split("_")[1]) not in active_ids:
                        self.track_history[tid].pop(0)
                        if not self.track_history[tid]:
                            del self.track_history[tid]

                density_val = compute_density(headcount, area_sq_m=stream["area_sq_m"])
                flow_vec = compute_flow_vector(velocities)
                vel_variance = compute_velocity_variance(velocities)
                turbulence = compute_flow_turbulence(velocities)
                heatmap = compute_spatial_heatmap(bboxes, rw, rh, grid_size=5)

                speeds = [math.sqrt(v[0]**2 + v[1]**2) for v in velocities]
                avg_speed = round(float(np.mean(speeds)), 2) if speeds else 0.0

                is_anomaly, event_type, severity = detect_anomaly(
                    density=density_val,
                    avg_speed=avg_speed,
                    velocity_variance=vel_variance,
                    turbulence=turbulence,
                )

                # Debouncing: 8 sustained frames
                if is_anomaly and event_type:
                    self.anomaly_counter[cam_key] = self.anomaly_counter.get(cam_key, 0) + 1
                else:
                    self.anomaly_counter[cam_key] = max(0, self.anomaly_counter.get(cam_key, 0) - 1)

                verified_anomaly = self.anomaly_counter.get(cam_key, 0) >= 8

                # Cooldown recording (30s)
                last_logged = self.last_incident_time.get(cam_key, 0.0)
                cur_time = asyncio.get_event_loop().time()
                if verified_anomaly and event_type and (cur_time - last_logged > 30.0):
                    self.last_incident_time[cam_key] = cur_time
                    new_inc_id = f"inc-{int(cur_time)}"
                    INCIDENTS_DB[new_inc_id] = {
                        "id": new_inc_id,
                        "camera_id": cam_key,
                        "zone_id": stream["zone_id"],
                        "event_type": event_type,
                        "severity": severity or 3,
                        "detected_at": now_iso,
                        "snapshot_url": f"/{stream['default_path'].split('/')[-1]}",
                        "metrics_json": {
                            "density": density_val,
                            "flow_vector": list(flow_vec),
                            "velocity_variance": vel_variance,
                            "headcount": headcount,
                            "avg_speed": avg_speed,
                            "heatmap": heatmap,
                        },
                        "acknowledged_by": None,
                        "acknowledged_at": None,
                        "resolved": False,
                        "resolved_at": None,
                        "notes": None,
                    }
                    logger.warning(f"🚨 [Phase 3 Alert Engine] New incident logged: {new_inc_id} on {cam_key} ({event_type})")

                payload = {
                    "camera_id": cam_key,
                    "zone_id": stream["zone_id"],
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
                    "snapshot_url": f"/{stream['default_path'].split('/')[-1]}",
                    "cameraId": cam_key,
                    "zoneName": stream["zoneName"],
                    "headcount": headcount,
                    "density": "critical" if density_val >= 5.0 else "high" if density_val >= 3.0 else "moderate" if density_val >= 1.5 else "low",
                    "flowDirection": round((math.degrees(math.atan2(flow_vec[1], flow_vec[0])) + 360) % 360, 1) if (flow_vec[0] or flow_vec[1]) else 0.0,
                    "avgSpeed": avg_speed,
                    "heatmap": heatmap,
                    "anomaly": verified_anomaly,
                    "anomalyType": event_type if verified_anomaly else None,
                    "timestamp": now_iso,
                }

                await self.broadcast_payload(payload)

            await asyncio.sleep(0.08)

stream_worker = StreamWorker()
