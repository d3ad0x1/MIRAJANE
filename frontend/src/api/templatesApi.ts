import { api } from "./client";
import type { PortMapping } from "./containersApi";

export type TemplateVolumeMount = {
  volume_name: string;
  mountpoint: string;
  read_only: boolean;
};

export type TemplateSummary = {
  id: string;
  name: string;
  description: string;
  image: string;
  default_ports: PortMapping[];
  default_env: Record<string, string>;
  default_volumes: TemplateVolumeMount[];
};

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  "http://10.11.12.185:8088/api/v1";

export async function fetchTemplates(): Promise<TemplateSummary[]> {
  return api.get<TemplateSummary[]>("/templates");
}

export async function fetchTemplate(
  id: string
): Promise<TemplateSummary> {
  return api.get<TemplateSummary>(`/templates/${id}`);
}

export async function createTemplate(
  tpl: TemplateSummary
): Promise<TemplateSummary> {
  return api.post<TemplateSummary>("/templates", tpl);
}

// обновление делаем через PUT (через fetch, чтобы не ломать client)
export async function updateTemplatePut(
  id: string,
  tpl: TemplateSummary
): Promise<TemplateSummary> {
  const res = await fetch(`${API_BASE}/templates/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tpl),
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as TemplateSummary;
}

export async function deleteTemplate(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/templates/${id}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
}

export function getTemplatesExportUrl(): string {
  return `${API_BASE}/templates/export`;
}

export async function importTemplates(
  templates: TemplateSummary[],
  mode: "merge" | "replace" = "merge"
): Promise<TemplateSummary[]> {
  const res = await fetch(`${API_BASE}/templates/import?mode=${mode}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ templates }),
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as TemplateSummary[];
}
