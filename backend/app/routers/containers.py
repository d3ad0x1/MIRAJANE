from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from docker.client import DockerClient
from docker.models.containers import Container

from app.deps import get_docker_client
from app.schemas import (
    ContainerSummary,
    ContainerDetail,
    PortMapping,
    ContainerCreateRequest,
)

router = APIRouter()


def _map_ports(port_data) -> list[PortMapping]:
    ports: list[PortMapping] = []
    if not port_data:
        return ports

    for container_port, bindings in port_data.items():
        try:
            port_str, proto = container_port.split("/")
            c_port = int(port_str)
        except ValueError:
            continue

        if not bindings:
            ports.append(
                PortMapping(
                    host_port=None,
                    container_port=c_port,
                    protocol=proto,
                )
            )
        else:
            for b in bindings:
                host_port = int(b.get("HostPort", 0)) if b.get("HostPort") else None
                ports.append(
                    PortMapping(
                        host_port=host_port,
                        container_port=c_port,
                        protocol=proto,
                    )
                )

    return ports


def _format_uptime(started_at: str | None) -> str | None:
    if not started_at:
        return None

    try:
        dt = datetime.fromisoformat(started_at.replace("Z", "+00:00"))
    except ValueError:
        return None

    now = datetime.now(timezone.utc)
    delta = now - dt

    seconds = int(delta.total_seconds())
    if seconds < 0:
        return None

    minutes = seconds // 60
    hours = minutes // 60
    days = hours // 24

    if days > 0:
        return f"{days}d {hours % 24}h"
    if hours > 0:
        return f"{hours}h {minutes % 60}m"
    if minutes > 0:
        return f"{minutes}m"
    return f"{seconds}s"


@router.get("", response_model=list[ContainerSummary])
def list_containers(
    all: bool = True,
    client: DockerClient = Depends(get_docker_client),
) -> List[ContainerSummary]:
    docker_containers: list[Container] = client.containers.list(all=all)
    result: list[ContainerSummary] = []

    for c in docker_containers:
        attrs = c.attrs or {}
        state = attrs.get("State", {}) or {}
        status = state.get("Status") or c.status or "unknown"

        net = attrs.get("NetworkSettings", {}) or {}
        port_data = net.get("Ports") or {}

        image_name = ""
        if c.image:
            if c.image.tags:
                image_name = c.image.tags[0]
            else:
                image_name = c.image.short_id

        result.append(
            ContainerSummary(
                id=c.id,
                name=c.name,
                image=image_name,
                status=status,
                state=status,
                ports=_map_ports(port_data),
            )
        )

    return result


@router.get("/{container_id}", response_model=ContainerDetail)
def get_container(
    container_id: str,
    client: DockerClient = Depends(get_docker_client),
) -> ContainerDetail:
    try:
        c: Container = client.containers.get(container_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Container not found")

    attrs = c.attrs or {}
    state = attrs.get("State", {}) or {}
    status = state.get("Status") or c.status or "unknown"

    net = attrs.get("NetworkSettings", {}) or {}
    port_data = net.get("Ports") or {}

    image_name = ""
    if c.image:
        if c.image.tags:
            image_name = c.image.tags[0]
        else:
            image_name = c.image.short_id

    cpu_percent = None
    mem_usage = None
    uptime = _format_uptime(state.get("StartedAt"))

    return ContainerDetail(
        id=c.id,
        name=c.name,
        image=image_name,
        status=status,
        state=status,
        ports=_map_ports(port_data),
        cpu_percent=cpu_percent,
        memory_usage=mem_usage,
        uptime=uptime,
    )


# ===== ЛОГИ КОНТЕЙНЕРА =====

class ContainerLogsResponse(BaseModel):
    content: str


@router.get("/{container_id}/logs", response_model=ContainerLogsResponse)
def get_container_logs(
    container_id: str,
    client: DockerClient = Depends(get_docker_client),
    tail: int = Query(500, ge=1, le=5000),
) -> ContainerLogsResponse:
    """
    Возвращает последние `tail` строк логов контейнера.
    """
    try:
        c: Container = client.containers.get(container_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Container not found")

    try:
        raw = c.logs(tail=tail)
        if isinstance(raw, bytes):
            text = raw.decode("utf-8", errors="replace")
        else:
            text = str(raw)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read logs: {e}")

    return ContainerLogsResponse(content=text)


@router.post("/{container_id}/start")
def start_container(
    container_id: str,
    client: DockerClient = Depends(get_docker_client),
):
    try:
        c: Container = client.containers.get(container_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Container not found")

    try:
        c.start()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start: {e}")

    return {"result": "ok"}


@router.post("/{container_id}/stop")
def stop_container(
    container_id: str,
    client: DockerClient = Depends(get_docker_client),
):
    try:
        c: Container = client.containers.get(container_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Container not found")

    try:
        c.stop()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stop: {e}")

    return {"result": "ok"}


@router.post("/{container_id}/restart")
def restart_container(
    container_id: str,
    client: DockerClient = Depends(get_docker_client),
):
    try:
        c: Container = client.containers.get(container_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Container not found")

    try:
        c.restart()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to restart: {e}")

    return {"result": "ok"}


# ===== СОЗДАНИЕ НОВОГО КОНТЕЙНЕРА =====


@router.post("", response_model=ContainerSummary, status_code=201)
def create_container(
    payload: ContainerCreateRequest,
    client: DockerClient = Depends(get_docker_client),
) -> ContainerSummary:
    ports_dict: dict[str, int | None] = {}
    for p in payload.ports:
        key = f"{p.container_port}/{p.protocol}"
        ports_dict[key] = p.host_port if p.host_port is not None else None

    volumes_dict: dict[str, dict] = {}
    for v in payload.volumes:
        volumes_dict[v.volume_name] = {
            "bind": v.mountpoint,
            "mode": "ro" if v.read_only else "rw",
        }

    restart_policy = {}
    if payload.restart_policy and payload.restart_policy != "no":
        restart_policy = {"Name": payload.restart_policy}

    try:
        c: Container = client.containers.run(
            image=payload.image,
            name=payload.name or None,
            detach=True,
            ports=ports_dict or None,
            environment=payload.env or None,
            volumes=volumes_dict or None,
            restart_policy=restart_policy or None,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create container: {e}")

    # берём свежие атрибуты после создания
    c.reload()
    attrs = c.attrs or {}
    state = attrs.get("State", {}) or {}
    status = state.get("Status") or c.status or "unknown"
    net = attrs.get("NetworkSettings", {}) or {}
    port_data = net.get("Ports") or {}

    image_name = ""
    if c.image:
        if c.image.tags:
            image_name = c.image.tags[0]
        else:
            image_name = c.image.short_id

    return ContainerSummary(
        id=c.id,
        name=c.name,
        image=image_name,
        status=status,
        state=status,
        ports=_map_ports(port_data),
    )
