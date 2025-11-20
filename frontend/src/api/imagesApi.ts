import { api } from "./client";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:8088/api/v1";

export type ImageSummary = {
  id: string;
  repo_tags: string[];
  size_bytes: number;
  created: string;
};

export type ImageContainerRef = {
  id: string;
  name: string;
  state: string;
  status: string;
};

export type ImageDetail = ImageSummary & {
  virtual_size_bytes: number | null;
  labels: Record<string, string>;
  containers: ImageContainerRef[];
};

export async function fetchImages(): Promise<ImageSummary[]> {
  return api.get<ImageSummary[]>("/images");
}

export async function fetchImage(
  id: string
): Promise<ImageDetail> {
  return api.get<ImageDetail>(`/images/${id}`);
}

export async function deleteImage(
  id: string,
  force: boolean = false
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/images/${encodeURIComponent(id)}?force=${
      force ? "true" : "false"
    }`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
}
