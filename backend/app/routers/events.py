from __future__ import annotations

import asyncio
import threading
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from docker.client import DockerClient

from app.deps import get_docker_client

router = APIRouter()


@router.websocket("/stream")
async def docker_events_stream(
    websocket: WebSocket,
    client: DockerClient = Depends(get_docker_client),
):
    """
    Стрим событий Docker через docker.events.

    Маппинг:
      create  -> type: "created"
      destroy -> type: "removed"
      start/restart/unpause -> type: "status_change", status: "running"
      stop/kill/die         -> type: "status_change", status: "exited"
      pause                  -> type: "status_change", status: "paused"
    """
    await websocket.accept()
    loop = asyncio.get_running_loop()
    queue: asyncio.Queue[dict] = asyncio.Queue()

    def pump_events():
        try:
            for ev in client.events(decode=True):
                # передаём события в асинхронный цикл
                asyncio.run_coroutine_threadsafe(queue.put(ev), loop)
        except Exception:
            # при закрытии сокета/демона просто выходим
            pass

    # отдельный поток, чтобы не блокировать обработчик
    t = threading.Thread(target=pump_events, daemon=True)
    t.start()

    try:
        while True:
            ev = await queue.get()

            if ev.get("Type") != "container":
                continue

            raw_status = (ev.get("status") or "").lower()
            cid = ev.get("id") or ""
            actor = ev.get("Actor") or {}
            attrs = actor.get("Attributes") or {}

            name = attrs.get("name") or cid[:12]
            image = attrs.get("image") or ""

            mapped_type: str | None = None
            out_status: str = raw_status

            if raw_status == "create":
                mapped_type = "created"
                out_status = "created"
            elif raw_status in ("destroy",):
                mapped_type = "removed"
                out_status = "removed"
            elif raw_status in ("start", "restart", "unpause"):
                mapped_type = "status_change"
                out_status = "running"
            elif raw_status in ("stop", "kill", "die"):
                mapped_type = "status_change"
                out_status = "exited"
            elif raw_status in ("pause",):
                mapped_type = "status_change"
                out_status = "paused"
            else:
                # остальные события нам пока не нужны
                continue

            now_iso = datetime.now(timezone.utc).isoformat()

            await websocket.send_json(
                {
                    "type": mapped_type,
                    "id": cid,
                    "name": name,
                    "image": image,
                    "status": out_status,
                    "raw_status": raw_status,
                    "time": now_iso,
                }
            )
    except WebSocketDisconnect:
        return
    except Exception:
        try:
            await websocket.close()
        except Exception:
            pass
