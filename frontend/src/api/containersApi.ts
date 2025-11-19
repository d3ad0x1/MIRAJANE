import { api } from "./client";

export type PortMapping = {
  host_port: number | null;
  container_port: number;
  protocol: string;
};

export type ContainerSummary = {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  ports: PortMapping[];
};

export type ContainerDetail = ContainerSummary & {
  cpu_percent: number | null;
  memory_usage: number | null;
  uptime: string | null;
};

export type ContainerCreatePayload = {
  name: string;
  image: string;
  restart_policy: string;
  ports: {
    host_port: number | null;
    container_port: number;
    protocol: string;
  }[];
  env: Record<string, string>;
  volumes: {
    volume_name: string;
    mountpoint: string;
    read_only: boolean;
  }[];
};

// ====== READ ======

export async function fetchContainers(): Promise<ContainerSummary[]> {
  return api.get<ContainerSummary[]>("/containers");
}

export async function fetchContainer(id: string): Promise<ContainerDetail> {
  return api.get<ContainerDetail>(`/containers/${id}`);
}

// ====== ACTIONS (start/stop/restart) ======

export async function startContainer(id: string): Promise<void> {
  await api.post(`/containers/${id}/start`);
}

export async function stopContainer(id: string): Promise<void> {
  await api.post(`/containers/${id}/stop`);
}

export async function restartContainer(id: string): Promise<void> {
  await api.post(`/containers/${id}/restart`);
}

// ====== CREATE ======

export async function createContainer(
  payload: ContainerCreatePayload
): Promise<ContainerSummary> {
  return api.post<ContainerSummary>("/containers", payload);
}

export async function fetchContainerLogs(
  id: string,
  tail: number = 500
): Promise<string> {
  const res = await api.get<{ content: string }>(
    `/containers/${id}/logs?tail=${tail}`
  );
  return res.content;
}

