# app/schemas/networks.py

from typing import List, Optional
from pydantic import BaseModel


class NetworkContainerRef(BaseModel):
    """
    Короткая информация о контейнере внутри сети.
    """
    id: str
    name: str
    ipv4_address: Optional[str] = None


class NetworkSummary(BaseModel):
    """
    Список сетей (короткий формат).
    """
    id: str
    name: str
    driver: str
    scope: Optional[str] = None


class NetworkDetail(NetworkSummary):
    """
    Детальная информация о сети.
    """

    containers: List[NetworkContainerRef] = []
    labels: dict = {}
