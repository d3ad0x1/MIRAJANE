const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8088/api/v1";

const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, ""); // без хвостового слеша

function buildWsBaseUrl() {
  if (API_BASE_URL.startsWith("https://")) {
    return "wss://" + API_BASE_URL.slice("https://".length);
  }
  if (API_BASE_URL.startsWith("http://")) {
    return "ws://" + API_BASE_URL.slice("http://".length);
  }
  return API_BASE_URL;
}

export const EVENTS_WS_URL = `${buildWsBaseUrl()}/events/stream`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
};
