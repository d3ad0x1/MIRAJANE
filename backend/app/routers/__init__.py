from .system import router as system_router
from .containers import router as containers_router
from .events import router as events_router
from .images import router as images_router
from .volumes import router as volumes_router
from .templates import router as templates_router
from .networks import router as networks_router

__all__ = [
    "system_router",
    "containers_router",
    "events_router",
    "images_router",
    "volumes_router",
    "templates_router",
    "networks_router",
]
