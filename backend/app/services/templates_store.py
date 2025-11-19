import json
import os
from pathlib import Path
from typing import List

from app.schemas import TemplateSummary, TemplateVolumeMount, PortMapping

TEMPLATES_FILE = Path(
    os.getenv("MIRA_TEMPLATES_FILE", "/data/templates.json")
)


def _default_templates() -> List[TemplateSummary]:
    return [
        TemplateSummary(
            id="basic-nginx",
            name="Basic Nginx",
            description="Simple Nginx container exposing port 80.",
            image="nginx:alpine",
            default_ports=[
                PortMapping(host_port=8080, container_port=80, protocol="tcp")
            ],
            default_env={},
            default_volumes=[],
        ),
        TemplateSummary(
            id="mira-web",
            name="Mira Web",
            description="Frontend for Mira served by Nginx.",
            image="nginx:alpine",
            default_ports=[
                PortMapping(host_port=8089, container_port=80, protocol="tcp")
            ],
            default_env={},
            default_volumes=[],
        ),
        TemplateSummary(
            id="mariadb-basic",
            name="MariaDB Basic",
            description="MariaDB database with default environment variables.",
            image="mariadb:11",
            default_ports=[
                PortMapping(host_port=None, container_port=3306, protocol="tcp")
            ],
            default_env={
                "MYSQL_ROOT_PASSWORD": "root",
                "MYSQL_DATABASE": "app",
            },
            default_volumes=[
                TemplateVolumeMount(
                    volume_name="mariadb_data",
                    mountpoint="/var/lib/mysql",
                    read_only=False,
                )
            ],
        ),
    ]


def load_templates() -> List[TemplateSummary]:
    if not TEMPLATES_FILE.exists():
        # первая инициализация — записываем дефолт
        templates = _default_templates()
        save_templates(templates)
        return templates

    try:
        data = json.loads(TEMPLATES_FILE.read_text("utf-8"))
        return [TemplateSummary.model_validate(obj) for obj in data]
    except Exception:
        # если файл битый — не падаем, а откатываемся к дефолту
        templates = _default_templates()
        save_templates(templates)
        return templates


def save_templates(templates: List[TemplateSummary]) -> None:
    TEMPLATES_FILE.parent.mkdir(parents=True, exist_ok=True)
    payload = [t.model_dump(mode="json") for t in templates]
    TEMPLATES_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), "utf-8")
