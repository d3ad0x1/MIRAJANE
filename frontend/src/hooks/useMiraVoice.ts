import { useCallback, useRef } from "react";
import type { DockerEventMessage } from "./useDockerEvents";

type LastSpoken = {
  key: string;
  ts: number; // timestamp в ms
};

export function useMiraVoice() {
  const lastSpokenRef = useRef<LastSpoken | null>(null);

  const handleEvent = useCallback((ev: DockerEventMessage) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const name = ev.name || ev.id.slice(0, 12);

    // Ключ для дедупликации: контейнер + тип сообщения
    const key = `${ev.id}:${ev.type}:${ev.status.toLowerCase()}`;
    const now = Date.now();
    const last = lastSpokenRef.current;

    // Если за последние 2 секунды уже говорили эту же фразу — пропускаем
    if (last && last.key === key && now - last.ts < 2000) {
      return;
    }

    let text = "";

    if (ev.type === "created") {
      text = `New container ${name} was created.`;
    } else if (ev.type === "removed") {
      text = `Container ${name} was removed.`;
    } else if (ev.type === "status_change") {
      const status = ev.status.toLowerCase();
      if (status === "running") {
        text = `Container ${name} is now running.`;
      } else if (status === "exited") {
        text = `Container ${name} has stopped.`;
      } else if (status === "paused") {
        text = `Container ${name} is paused.`;
      } else {
        text = `Container ${name} changed status to ${status}.`;
      }
    }

    if (!text) return;

    // Запоминаем, что мы это уже сказали
    lastSpokenRef.current = { key, ts: now };

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";   // всегда английский
    utter.rate = 1.0;
    utter.pitch = 1.0;

    window.speechSynthesis.speak(utter);
  }, []);

  return { handleEvent };
}
