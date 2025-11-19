# app/schemas/containers.py

from typing import List, Dict, Optional
from pydantic import BaseModel


class PortMapping(BaseModel):
    host_port: Optional[int] = None
    container_port: int
    protocol: str = "tcp"


class ContainerSummary(BaseModel):
    id: str
    name: str
    image: str
    status: str
    state: str
    ports: List[PortMapping] = []


class ContainerDetail(ContainerSummary):
    cpu_percent: Optional[float] = None
    memory_usage: Optional[int] = None
    uptime: Optional[str] = None


class VolumeMount(BaseModel):
    """
    Описание одного тома при создании контейнера.
    volume_name — имя docker volume
    mountpoint  — путь внутри контейнера
    read_only   — true, если монтируем в режиме ro
    """

    volume_name: str
    mountpoint: str
    read_only: bool = False


class ContainerCreateRequest(BaseModel):
    """
    Тело запроса для создания нового контейнера.
    Используется в POST /api/v1/containers
    """

    name: Optional[str] = None
    image: str

    # список портов, которые нужно пробросить
    ports: List[PortMapping] = []

    # переменные окружения (ENV)
    env: Dict[str, str] = {}

    # список томов
    volumes: List[VolumeMount] = []

    # политика рестарта: "no", "always", "unless-stopped", "on-failure"
    restart_policy: Optional[str] = None
