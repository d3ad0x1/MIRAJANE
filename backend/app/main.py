from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    system_router,
    containers_router,
    events_router,
    images_router,
    volumes_router,
    templates_router,
    networks_router,
)

app = FastAPI(
    title="Mira API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(system_router, prefix="/api/v1/system", tags=["system"])
app.include_router(containers_router, prefix="/api/v1/containers", tags=["containers"])
app.include_router(events_router, prefix="/api/v1/events", tags=["events"])
app.include_router(images_router, prefix="/api/v1/images", tags=["images"])
app.include_router(volumes_router, prefix="/api/v1/volumes", tags=["volumes"])
app.include_router(templates_router, prefix="/api/v1/templates", tags=["templates"])
app.include_router(networks_router, prefix="/api/v1/networks", tags=["networks"])


@app.get("/")
def root():
    return {"service": "mira-api", "docs": "/docs"}
