# app/routers/networks.py

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from docker.client import DockerClient
from docker.models.networks import Network as DockerNetwork

from app.deps import get_docker_client
from app.schemas import NetworkSummary, NetworkDetail, NetworkContainerRef

router = APIRouter()


class NetworkCreatePayload(BaseModel):
    name: str
    driver: str = "bridge"
    internal: bool | None = None
    attachable: bool | None = None


def _map_network_summary(n: DockerNetwork) -> NetworkSummary:
    attrs = n.attrs or {}
    driver = attrs.get("Driver") or ""
    scope = attrs.get("Scope")
    return NetworkSummary(
        id=n.id,
        name=n.name,
        driver=driver,
        scope=scope,
    )


@router.get("", response_model=List[NetworkSummary])
def list_networks(
    client: DockerClient = Depends(get_docker_client),
) -> List[NetworkSummary]:
    try:
        nets: List[DockerNetwork] = client.networks.list()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list networks: {e}")

    return [_map_network_summary(n) for n in nets]


@router.get("/{network_id}", response_model=NetworkDetail)
def get_network(
    network_id: str,
    client: DockerClient = Depends(get_docker_client),
) -> NetworkDetail:
    try:
        n: DockerNetwork = client.networks.get(network_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Network not found")

    attrs = n.attrs or {}
    driver = attrs.get("Driver") or ""
    scope = attrs.get("Scope")
    labels = attrs.get("Labels") or {}

    containers_data = attrs.get("Containers") or {}
    containers: list[NetworkContainerRef] = []

    for cid, info in containers_data.items():
        name = info.get("Name") or ""
        ipv4_raw = info.get("IPv4Address") or ""
        ipv4 = ipv4_raw.split("/")[0] if ipv4_raw else None

        containers.append(
            NetworkContainerRef(
                id=cid,
                name=name,
                ipv4_address=ipv4,
            )
        )

    return NetworkDetail(
        id=n.id,
        name=n.name,
        driver=driver,
        scope=scope,
        labels=labels,
        containers=containers,
    )


@router.post("", response_model=NetworkSummary, status_code=201)
def create_network(
    payload: NetworkCreatePayload,
    client: DockerClient = Depends(get_docker_client),
) -> NetworkSummary:
    kwargs: dict = {
        "name": payload.name,
        "driver": payload.driver or "bridge",
    }

    if payload.internal is not None:
        kwargs["internal"] = payload.internal
    if payload.attachable is not None:
        kwargs["attachable"] = payload.attachable

    try:
        n: DockerNetwork = client.networks.create(**kwargs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create network: {e}")

    return _map_network_summary(n)


@router.delete("/{network_id}")
def delete_network(
    network_id: str,
    client: DockerClient = Depends(get_docker_client),
):
    try:
        n: DockerNetwork = client.networks.get(network_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Network not found")

    # Защитимся от удаления системных сетей
    if n.name in ("bridge", "host", "none"):
        raise HTTPException(status_code=400, detail="Cannot delete system network")

    try:
        n.remove()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete network: {e}")

    return {"result": "ok"}
