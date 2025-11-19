from typing import List

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.schemas import TemplateSummary
from app.services.templates_store import load_templates, save_templates

router = APIRouter()


def _find_index(templates: List[TemplateSummary], template_id: str) -> int:
    for i, t in enumerate(templates):
        if t.id == template_id:
            return i
    return -1


# ===== Базовый список =====

@router.get("", response_model=List[TemplateSummary])
def list_templates():
    return load_templates()


# ===== Сначала спец-роуты: export / import =====

class TemplatesImportPayload(BaseModel):
    templates: list[TemplateSummary]


@router.get("/export")
def export_templates():
    """
    Отдать все шаблоны одним JSON-файлом.
    """
    templates = load_templates()
    return JSONResponse(
        content=[t.model_dump(mode="json") for t in templates],
        media_type="application/json",
    )


@router.post("/import", response_model=list[TemplateSummary])
def import_templates(
    payload: TemplatesImportPayload,
    mode: str = Query("merge", pattern="^(merge|replace)$"),
):
    """
    Импорт шаблонов.
    mode=merge (по умолчанию) — обновить существующие по id и добавить новые.
    mode=replace — полностью заменить текущий список.
    """
    existing = load_templates()

    if mode == "replace":
        merged = payload.templates
    else:  # merge
        merged: list[TemplateSummary] = existing.copy()
        for new_tpl in payload.templates:
            for i, old in enumerate(merged):
                if old.id == new_tpl.id:
                    merged[i] = new_tpl
                    break
            else:
                merged.append(new_tpl)

    save_templates(merged)
    return merged


# ===== Теперь роуты с параметром {template_id} =====

@router.get("/{template_id}", response_model=TemplateSummary)
def get_template(template_id: str):
    templates = load_templates()
    idx = _find_index(templates, template_id)
    if idx < 0:
        raise HTTPException(status_code=404, detail="Template not found")
    return templates[idx]


@router.post("", response_model=TemplateSummary, status_code=201)
def create_template(payload: TemplateSummary):
    templates = load_templates()

    if any(t.id == payload.id for t in templates):
        raise HTTPException(status_code=400, detail="Template id already exists")

    templates.append(payload)
    save_templates(templates)
    return payload


@router.put("/{template_id}", response_model=TemplateSummary)
def update_template(template_id: str, payload: TemplateSummary):
    templates = load_templates()
    idx = _find_index(templates, template_id)
    if idx < 0:
        raise HTTPException(status_code=404, detail="Template not found")

    # если id поменяли — проверим на уникальность
    if payload.id != template_id and any(t.id == payload.id for t in templates):
        raise HTTPException(
            status_code=400, detail="Another template with the same id already exists"
        )

    templates[idx] = payload
    save_templates(templates)
    return payload


@router.delete("/{template_id}", status_code=204)
def delete_template(template_id: str):
    templates = load_templates()
    idx = _find_index(templates, template_id)
    if idx < 0:
        raise HTTPException(status_code=404, detail="Template not found")

    templates.pop(idx)
    save_templates(templates)
    return
