export type ContainerStatus = "running" | "exited" | "paused";

export type ContainerItem = {
  id: string;
  name: string;
  image: string;
  status: ContainerStatus;
  cpuPercent: number;
  memoryMb: number;
  ports: string;
  uptime: string;
};

export const MOCK_CONTAINERS: ContainerItem[] = [
  {
    id: "1",
    name: "mira-api",
    image: "mirajane/api:latest",
    status: "running",
    cpuPercent: 3.2,
    memoryMb: 128,
    ports: "8088 → 8000/tcp",
    uptime: "1h 23m",
  },
  {
    id: "2",
    name: "mira-web",
    image: "mirajane/web:latest",
    status: "running",
    cpuPercent: 1.1,
    memoryMb: 96,
    ports: "8089 → 4173/tcp",
    uptime: "2h 05m",
  },
  {
    id: "3",
    name: "mariadb",
    image: "mariadb:11",
    status: "exited",
    cpuPercent: 0,
    memoryMb: 0,
    ports: "3306/tcp",
    uptime: "stopped",
  },
];
