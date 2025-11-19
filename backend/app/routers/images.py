from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from docker.client import DockerClient
from docker.models.images import Image
from docker.models.containers import Container as DockerContainer

from app.deps import get_docker_client

router = APIRouter()


@router.get("")
def list_images(client: DockerClient = Depends(get_docker_client)):
    """
    Возвращает список образов в простом JSON-формате,
    без использования pydantic-схем (чтобы исключить ошибки валидации).
    """
    try:
        images: List[Image] = client.images.list()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list images: {e}")

    result = []
    for img in images:
        attrs = img.attrs or {}
        size = int(attrs.get("Size") or 0)
        created = str(attrs.get("Created") or "")
        tags = img.tags or []

        result.append(
            {
                "id": img.id,
                "repo_tags": tags,
                "size_bytes": size,
                "created": created,
            }
        )

    return result


@router.get("/{image_id}")
def get_image(image_id: str, client: DockerClient = Depends(get_docker_client)):
    """
    Детальная информация об образе + список контейнеров, использующих его.
    Тоже без pydantic-схем.
    """
    try:
        img: Image = client.images.get(image_id)
    except Exception:
        try:
            img = client.images.get(image_id.strip())
        except Exception:
            raise HTTPException(status_code=404, detail="Image not found")

    try:
        containers: List[DockerContainer] = client.containers.list(
            all=True, filters={"ancestor": img.id}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list containers: {e}")

    attrs = img.attrs or {}
    size = int(attrs.get("Size") or 0)
    vsize = attrs.get("VirtualSize")
    created = str(attrs.get("Created") or "")
    labels = attrs.get("Config", {}).get("Labels") or {}

    cont_list = []
    for c in containers:
        cattrs = c.attrs or {}
        c_state = (cattrs.get("State") or {}).get("Status") or c.status or "unknown"
        c_status = cattrs.get("Status") or c.status or ""
        cont_list.append(
            {
                "id": c.id,
                "name": c.name,
                "state": c_state,
                "status": c_status,
            }
        )

    return {
        "id": img.id,
        "repo_tags": img.tags or [],
        "size_bytes": size,
        "virtual_size_bytes": vsize,
        "created": created,
        "labels": labels,
        "containers": cont_list,
    }


@router.delete("/{image_id}")
def delete_image(
    image_id: str,
    client: DockerClient = Depends(get_docker_client),
    force: bool = Query(False),
):
    """
    Удаление образа. Если force=true — как `docker rmi -f`.
    """
    try:
        client.images.remove(image=image_id, force=force)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove image: {e}")

    return {"result": "ok"}
