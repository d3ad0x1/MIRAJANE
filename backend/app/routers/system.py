from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health")
def health():
    return {
        "status": "ok",
        "service": "mira-api",
        "time": datetime.utcnow().isoformat() + "Z",
    }
