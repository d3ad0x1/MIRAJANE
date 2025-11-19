import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import ContainerStatusBadge from "../../components/containers/ContainerStatusBadge";
import {
  fetchContainers,
  type ContainerSummary,
  type PortMapping,
  startContainer,
  stopContainer,
  restartContainer,
} from "../../api/containersApi";

function formatPorts(ports: PortMapping[]): string {
  if (!ports || ports.length === 0) return "-";
  return ports
    .map((p) =>
      p.host_port
        ? `${p.host_port} → ${p.container_port}/${p.protocol}`
        : `${p.container_port}/${p.protocol}`
    )
    .join(", ");
}

export default function ContainersListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [items, setItems] = useState<ContainerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  async function loadContainers() {
    setLoading(true);
    setErr(null);
    try {
      const data = await fetchContainers();
      setItems(data);
    } catch (e: any) {
      setErr(e.message || "Failed to load containers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContainers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.image.toLowerCase().includes(q)
    );
  }, [search, items]);

  async function handleAction(
    c: ContainerSummary,
    action: "start" | "stop" | "restart"
  ) {
    setActionId(`${c.id}:${action}`);
    try {
      if (action === "start") {
        await startContainer(c.id);
      } else if (action === "stop") {
        await stopContainer(c.id);
      } else {
        await restartContainer(c.id);
      }
      await loadContainers();
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  }

  const isActionLoading = (id: string, action: string) =>
    actionId === `${id}:${action}`;

  return (
    <div className="space-y-4">
      {/* шапка страницы */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-mira-neon drop-shadow-[0_0_14px_rgba(36,213,255,0.7)]">
            {t("containers.title")}
          </h1>
          <p className="text-xs text-mira-textSecondary mt-1">
            {t("containers.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/containers/new")}
            className="
              px-3 py-2 text-xs rounded-lg
              bg-mira-neon text-black font-semibold
              shadow-mira-neon hover:shadow-mira-neon-soft
              hover:bg-[#4BE3FF]
              transition-all duration-300
            "
          >
            + New container
          </button>
        </div>
      </div>

      {/* поиск */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("containers.search.placeholder")}
            className="
              w-full bg-mira-panel border border-mira-border rounded-lg
              px-3 py-2 text-sm text-mira-textPrimary
              placeholder:text-mira-textSecondary/70
              focus:outline-none focus:ring-2 focus:ring-mira-neon focus:border-mira-neon
              shadow-[0_0_0_1px_rgba(15,23,42,0.6)]
            "
          />
        </div>
        <div className="text-xs text-mira-textSecondary">
          {filtered.length} / {items.length}
        </div>
      </div>

      {/* состояния загрузки / ошибки */}
      {loading && (
        <div className="bg-mira-panel border border-mira-border rounded-xl p-4 text-sm text-mira-textSecondary">
          Loading containers...
        </div>
      )}

      {err && !loading && (
        <div className="bg-[#220815] border border-mira-danger rounded-xl p-4 text-sm text-mira-danger shadow-[0_0_18px_rgba(255,85,115,0.45)]">
          {err}
        </div>
      )}

      {/* таблица */}
      {!loading && !err && (
        <div className="border border-mira-border rounded-xl overflow-hidden bg-mira-panel/80 shadow-[0_0_40px_rgba(15,23,42,0.9)]">
          <table className="w-full text-sm">
            <thead className="bg-black/40 border-b border-mira-border">
              <tr className="text-left text-xs text-mira-textSecondary uppercase tracking-wide">
                <th className="px-3 py-2 w-32">
                  {t("containers.table.headers.status")}
                </th>
                <th className="px-3 py-2">
                  {t("containers.table.headers.name")}
                </th>
                <th className="px-3 py-2">
                  {t("containers.table.headers.image")}
                </th>
                <th className="px-3 py-2 w-48">
                  {t("containers.table.headers.ports")}
                </th>
                <th className="px-3 py-2 w-32">
                  {t("containers.table.headers.uptime")}
                </th>
                <th className="px-3 py-2 w-40 text-right">
                  {t("containers.table.headers.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="
                    border-b border-mira-border/60 last:border-b-0
                    hover:bg-slate-900/40 transition-colors
                  "
                >
                  <td className="px-3 py-2 align-middle">
                    <ContainerStatusBadge status={c.status} />
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <div className="flex flex-col">
                      <Link
                        to={`/containers/${c.id}`}
                        className="
                          font-medium text-mira-textPrimary
                          hover:text-mira-neon
                          transition-colors
                        "
                      >
                        {c.name}
                      </Link>
                      <span className="text-[10px] text-mira-textSecondary mt-0.5">
                        {c.id.slice(0, 12)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 align-middle text-mira-textSecondary">
                    {c.image}
                  </td>
                  <td className="px-3 py-2 align-middle text-mira-textSecondary">
                    {formatPorts(c.ports)}
                  </td>
                  <td className="px-3 py-2 align-middle text-mira-textSecondary">
                    {/* позже сюда можно подставить uptime */}
                    -
                  </td>
                  <td className="px-3 py-2 align-middle text-right">
                    <div className="inline-flex gap-1">
                      {c.status !== "running" ? (
                        <button
                          onClick={() => handleAction(c, "start")}
                          disabled={isActionLoading(c.id, "start")}
                          className="
                            px-2 py-1 text-xs rounded-md
                            bg-mira-neon text-black font-semibold
                            shadow-mira-neon hover:shadow-mira-neon-soft
                            hover:bg-[#4BE3FF]
                            disabled:opacity-60 disabled:cursor-not-allowed
                            transition-all duration-300
                          "
                        >
                          {t("containers.actions.start")}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(c, "stop")}
                          disabled={isActionLoading(c.id, "stop")}
                          className="
                            px-2 py-1 text-xs rounded-md
                            bg-mira-danger/80 text-white
                            hover:bg-mira-danger
                            disabled:opacity-60 disabled:cursor-not-allowed
                            transition-colors
                          "
                        >
                          {t("containers.actions.stop")}
                        </button>
                      )}
                      <button
                        onClick={() => handleAction(c, "restart")}
                        disabled={isActionLoading(c.id, "restart")}
                        className="
                          px-2 py-1 text-xs rounded-md
                          bg-mira-accent text-white
                          hover:bg-mira-accent/90
                          disabled:opacity-60 disabled:cursor-not-allowed
                          transition-colors
                        "
                      >
                        {t("containers.actions.restart")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 text-center text-sm text-mira-textSecondary"
                  >
                    Нет контейнеров, подходящих под фильтр.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
