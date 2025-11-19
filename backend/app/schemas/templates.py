# app/schemas/templates.py

from typing import List, Dict, Optional, Union
from pydantic import BaseModel

from .containers import PortMapping


class TemplateVolumeMount(BaseModel):
    """
    Отдельная модель для томов в шаблоне.
    Логически совпадает с VolumeMount, но используется только в шаблонах.
    """

    volume_name: str
    mountpoint: str
    read_only: bool = False


class TemplateBase(BaseModel):
    """
    Базовая модель шаблона контейнера.
    Используется и для создания, и для обновления, и в ответах.
    """

    name: str
    description: Optional[str] = None
    image: str

    # какие порты будут проброшены по умолчанию
    ports: List[PortMapping] = []

    # ENV по умолчанию
    env: Dict[str, str] = {}

    # тома по умолчанию (через TemplateVolumeMount)
    volumes: List[TemplateVolumeMount] = []

    # политика рестарта: "no", "always", "unless-stopped", "on-failure"
    restart_policy: Optional[str] = None


class TemplateSummary(TemplateBase):
    """
    Короткий вид шаблона (для списка).
    """

    id: Union[int, str]


class TemplateDetail(TemplateSummary):
    """
    Детальный вид шаблона.
    Пока совпадает с TemplateSummary, но отдельный класс на будущее.
    """

    pass


class TemplateCreateRequest(TemplateBase):
    """
    Тело запроса для создания шаблона.
    ID задаётся на стороне сервера, поэтому здесь его нет.
    """

    pass


class TemplateUpdateRequest(TemplateBase):
    """
    Тело запроса для обновления шаблона.
    Обычно ID передаётся в URL, поэтому здесь его тоже нет.
    """

    pass
