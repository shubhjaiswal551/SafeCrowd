"""
SafeCrowd - Zones Router
Handles zone polygon definitions and calibrated square meters per camera.
"""

import uuid
from typing import Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from ..models.schemas import ZoneCreate, ZoneResponse
from .auth import get_current_user, require_admin

router = APIRouter(prefix="/zones", tags=["Zones"])

ZONES_DB: Dict[str, Dict] = {
    "zone-001": {
        "id": "zone-001",
        "camera_id": "cam-001",
        "name": "Main Entrance Gate",
        "polygon_coords": [(50.0, 50.0), (900.0, 50.0), (900.0, 500.0), (50.0, 500.0)],
        "area_sq_m": 45.0,
    },
    "zone-002": {
        "id": "zone-002",
        "camera_id": "cam-002",
        "name": "Central Courtyard",
        "polygon_coords": [(30.0, 30.0), (800.0, 30.0), (800.0, 480.0), (30.0, 480.0)],
        "area_sq_m": 60.0,
    },
}

@router.get("", response_model=List[ZoneResponse])
async def list_zones(camera_id: str = None, user: Dict = Depends(get_current_user)):
    if camera_id:
        return [z for z in ZONES_DB.values() if z["camera_id"] == camera_id]
    return list(ZONES_DB.values())

@router.post("", response_model=ZoneResponse, status_code=status.HTTP_201_CREATED)
async def create_zone(
    zone_in: ZoneCreate,
    admin_user: Dict = Depends(require_admin),
):
    zid = f"zone-{uuid.uuid4().hex[:6]}"
    zone = {
        "id": zid,
        "camera_id": zone_in.camera_id,
        "name": zone_in.name,
        "polygon_coords": zone_in.polygon_coords,
        "area_sq_m": zone_in.area_sq_m,
    }
    ZONES_DB[zid] = zone
    return zone

@router.delete("/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_zone(
    zone_id: str,
    admin_user: Dict = Depends(require_admin),
):
    if zone_id not in ZONES_DB:
        raise HTTPException(status_code=404, detail="Zone not found")
    del ZONES_DB[zone_id]
