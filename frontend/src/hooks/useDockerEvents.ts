import { useEffect } from "react";
import { EVENTS_WS_URL } from "../api/client";

export type DockerEventMessage = {
  type: "created" | "status_change" | "removed";
  id: string;
  name: string;
  image: string;
  status: string;
  raw_status?: string;
  time: string;
};

export function useDockerEvents(
  onEvent?: (event: DockerEventMessage) => void
) {
  useEffect(() => {
    const ws = new WebSocket(EVENTS_WS_URL);

    ws.onopen = () => {
      console.log("[Mira] WebSocket connected:", EVENTS_WS_URL);
    };

    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as DockerEventMessage;
        console.log("[Mira] event:", data);
        onEvent?.(data);
      } catch (err) {
        console.warn("[Mira] bad WS message:", err);
      }
    };

    ws.onclose = () => {
      console.log("[Mira] WebSocket closed");
    };

    ws.onerror = (e) => {
      console.error("[Mira] WebSocket error:", e);
    };

    return () => {
      ws.close();
    };
  }, [onEvent]);
}
