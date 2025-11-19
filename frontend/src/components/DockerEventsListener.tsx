import { useDockerEvents } from "../hooks/useDockerEvents";
import { useMiraVoice } from "../hooks/useMiraVoice";

export default function DockerEventsListener() {
  const { handleEvent } = useMiraVoice();

  // просто подписываемся, ничего не рисуем
  useDockerEvents(handleEvent);

  return null;
}
