import { api } from "./client";

export type VolumeSummary = {
  name: string;
  driver: string;
  mountpoint: string;
  labels: Record<string, string>;
  created_at: string | null;
};

export async function fetchVolumes(): Promise<VolumeSummary[]> {
  return api.get<VolumeSummary[]>("/volumes");
}
