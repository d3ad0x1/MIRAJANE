from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from typing import List, Dict
from pydantic import BaseModel


class ImageSummary(BaseModel):
    id: str
    repo_tags: List[str]
    size: int            # bytes
    created_at: Optional[datetime] = None


class VolumeSummary(BaseModel):
    name: str
    driver: str
    mountpoint: str
    labels: dict = {}
    created_at: Optional[datetime] = None

class ImageContainerRef(BaseModel):
    id: str
    name: str
    state: str
    status: str


class ImageDetail(BaseModel):
    id: str
    repo_tags: List[str]
    size_bytes: int
    virtual_size_bytes: int | None = None
    created: str
    labels: Dict[str, str]
    containers: List[ImageContainerRef] = []
