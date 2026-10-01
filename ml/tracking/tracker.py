"""
SafeCrowd - ByteTrack Multi-Object Tracker Module
Wraps Ultralytics YOLO with ByteTrack cross-frame identity linking.
"""

import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
import numpy as np
import torch
from ultralytics import YOLO

from .extract_trajectories import extract_trajectories

logger = logging.getLogger("safecrowd.ml.tracking")

CONFIG = {
    "default_weights": "ml/detection/weights/best.pt",
    "conf_threshold": 0.25,
    "iou_threshold": 0.5,
    "imgsz": 640,
    "tracker_config": "bytetrack.yaml",
}

class ByteTrackPipeline:
    def __init__(
        self,
        weights_path: Optional[str] = None,
        conf_threshold: Optional[float] = None,
        iou_threshold: Optional[float] = None,
        imgsz: Optional[int] = None,
        device: Optional[str] = None,
    ):
        path = weights_path or CONFIG["default_weights"]
        self.weights_path = path
        self.conf = conf_threshold or CONFIG["conf_threshold"]
        self.iou = iou_threshold or CONFIG["iou_threshold"]
        self.imgsz = imgsz or CONFIG["imgsz"]
        self.device = device or ("0" if torch.cuda.is_available() else "cpu")

        logger.info(f"Initializing ByteTrackPipeline with weights={path} on device={self.device}")
        self.model = YOLO(path)

    def track_frame(
        self,
        frame: np.ndarray,
        frame_idx: int = 0,
        timestamp: float = 0.0,
    ) -> Tuple[List[Dict[str, Any]], Any]:
        """
        Runs YOLO + ByteTrack on a single frame and returns structured trajectories + YOLO plot.
        """
        results = self.model.track(
            source=frame,
            conf=self.conf,
            iou=self.iou,
            imgsz=self.imgsz,
            persist=True,
            tracker=CONFIG["tracker_config"],
            device=self.device,
            verbose=False,
        )[0]

        trajectories = extract_trajectories(results, frame_idx=frame_idx, timestamp=timestamp)
        return trajectories, results
