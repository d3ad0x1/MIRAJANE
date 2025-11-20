// src/api/networksApi.ts

import { api } from "./client";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:8088/api/v1";

export type NetworkContainerRef = {
  id: string;
  name: string;
  ipv4_address?: string | null;
};

export type NetworkSummary = {
  id: string;
  name: string;
  driver: string;
  scope?: string | null;
};

export type NetworkDetail = NetworkSummary & {
  labels: Record<string, string>;
  containers: NetworkContainerRef[];
};

export type NetworkCreateRequest = {
  name: string;
  driver: string;
  internal?: boolean;
  attachable?: boolean;
};

export async function fetchNetworks(): Promise<NetworkSummary[]> {
  return api.get<NetworkSummary[]>("/networks");
}

export async function fetchNetwork(id: string): Promise<NetworkDetail> {
  return api.get<NetworkDetail>(`/networks/${id}`);
}

export async function createNetwork(
  payload: NetworkCreateRequest
): Promise<NetworkSummary> {
  return api.post<NetworkSummary>("/networks", payload);
}

export async function deleteNetwork(id: string): Promise<void> {
  const res = await fetch(
    `${API_BASE}/networks/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
}
