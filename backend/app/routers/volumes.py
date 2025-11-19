from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends
from docker.client import DockerClient

from app.deps import get_docker_client
from app.schemas import VolumeSummary

router = APIRouter()


@router.get("", response_model=List[VolumeSummary])
def list_volumes(
    client: DockerClient = Depends(get_docker_client),
) -> List[VolumeSummary]:
    vols = client.volumes.list()
    result: List[VolumeSummary] = []

    for v in vols:
        attrs = v.attrs or {}
        created_at = None
        try:
            created_raw = attrs.get("CreatedAt")
            if isinstance(created_raw, str):
                created_at = datetime.fromisoformat(
                    created_raw.replace("Z", "+00:00")
                )
        except Exception:
            created_at = None

        result.append(
            VolumeSummary(
                name=v.name,
                driver=attrs.get("Driver", ""),
                mountpoint=attrs.get("Mountpoint", ""),
                labels=attrs.get("Labels") or {},
                created_at=created_at,
            )
        )

    return result
