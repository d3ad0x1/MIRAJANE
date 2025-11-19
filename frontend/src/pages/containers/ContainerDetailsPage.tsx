// frontend/src/pages/containers/ContainerDetailsPage.tsx

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  fetchContainer,
  fetchContainerLogs,
  restartContainer,
  startContainer,
  stopContainer,
  type ContainerDetail,
} from "../../api/containersApi";

type TabKey = "overview" | "logs";

export default function ContainerDetailsPage() {
  const { id = "" } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [tab, setTab] = useState<TabKey>("overview");

  const [item, setItem] = useState<ContainerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [actionBusy, setActionBusy] = useState<null | "start" | "stop" | "restart">(null);

  // логи
  const [logs, setLogs] = useState<string>("");
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);

  // загрузка информации о контейнере
  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await fetchContainer(id);
      setItem(data);
    } catch (e: any) {
      setErr(e.message || "Failed to load container");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  // загрузка логов при переключении на вкладку Logs
  async function loadLogs() {
    setLogsLoading(true);
    setLogsError(null);
    try {
      const text = await fetchContainerLogs(id, 500);
      setLogs(text || "");
    } catch (e: any) {
      setLogsError(e.message || "Failed to load logs");
    } finally {
      setLogsLoading(false);
    }
  }

  useEffect(() => {
    if (tab === "logs") {
      loadLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, id]);

  async function doAction(kind: "start" | "stop" | "restart") {
    setActionBusy(kind);
    try {
      if (kind === "start") await startContainer(id);
      if (kind === "stop") await stopContainer(id);
      if (kind === "restart") await restartContainer(id);
      await load();
    } catch (e: any) {
      alert(e.message || "Action failed");
    } finally {
      setActionBusy(null);
    }
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: t("containers.details.tabs.overview") },
    { key: "logs", label: t("containers.details.tabs.logs") },
  ];

  const isRunning = item?.state === "running";

  return (
    <div className="space-y-4">
      {/* верхняя панель */}
      <div className="flex items-center justify-between gap-4">
        <button
          className="inline-flex items-center gap-2 text-xs text-mira-textSecondary hover:text-mira-neon transition-colors"
          onClick={() => navigate("/containers")}
        >
          ← {t("containers.details.backToList")}
        </button>

        {/* Actions */}
        {item && (
          <div className="flex items-center gap-2 text-xs">
            <span
              className={
                "inline-flex items-center px-2 py-1 rounded-full border text-[11px] transition-colors " +
                (isRunning
                  ? "border-mira-neon/40 text-mira-neon bg-mira-neon/10 shadow-mira-neon-soft"
                  : "border-mira-border text-mira-textSecondary bg-mira-panel")
              }
            >
              <span
                className={
                  "w-2 h-2 rounded-full mr-1 " +
                  (isRunning ? "bg-mira-neon" : "bg-mira-textSecondary/60")
                }
              />
              {item.state}
            </span>

            <button
              className="
                px-3 py-1 rounded-lg text-xs
                bg-mira-neon text-black font-semibold
                shadow-mira-neon hover:shadow-mira-neon-soft
                hover:bg-[#4BE3FF]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300
              "
              disabled={actionBusy !== null}
              onClick={() => doAction("start")}
            >
              {t("containers.actions.start")}
            </button>
            <button
              className="
                px-3 py-1 rounded-lg text-xs
                bg-mira-danger/80 text-white
                hover:bg-mira-danger
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
              "
              disabled={actionBusy !== null}
              onClick={() => doAction("stop")}
            >
              {t("containers.actions.stop")}
            </button>
            <button
              className="
                px-3 py-1 rounded-lg text-xs
                bg-mira-accent text-white
                hover:bg-mira-accent/90
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
              "
              disabled={actionBusy !== null}
              onClick={() => doAction("restart")}
            >
              {t("containers.actions.restart")}
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="bg-mira-panel border border-mira-border rounded-xl p-4 text-sm text-mira-textSecondary">
          Loading container...
        </div>
      )}

      {err && !loading && (
        <div className="bg-[#220815] border border-mira-danger rounded-xl p-4 text-sm text-mira-danger shadow-[0_0_20px_rgba(255,85,115,0.45)]">
          {err}
        </div>
      )}

      {!loading && !err && item && (
        <>
          {/* Заголовок + табы */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-mira-neon drop-shadow-[0_0_18px_rgba(36,213,255,0.75)]">
                {item.name}
              </h1>
              <p className="text-xs text-mira-textSecondary mt-1">
                ID:{" "}
                <span className="font-mono text-[11px] text-mira-textPrimary">
                  {item.id}
                </span>
              </p>
            </div>

            {/* Табы */}
            <div className="flex items-center">
              <div className="inline-flex rounded-full border border-mira-border p-1 text-xs bg-mira-panel/90 shadow-[0_0_24px_rgba(15,23,42,0.9)]">
                {tabs.map((tItem) => {
                  const isActive = tab === tItem.key;
                  return (
                    <button
                      key={tItem.key}
                      onClick={() => setTab(tItem.key)}
                      className={
                        "px-4 py-1 rounded-full font-medium transition-all " +
                        (isActive
                          ? "bg-mira-neon text-black shadow-mira-neon-soft"
                          : "text-mira-textSecondary hover:text-mira-textPrimary hover:bg-slate-900/70")
                      }
                    >
                      {tItem.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Контент вкладок */}
          {tab === "overview" && (
            <div className="bg-mira-panel border border-mira-border rounded-xl p-4 space-y-4 shadow-[0_0_40px_rgba(15,23,42,0.9)]">
              <h2 className="text-sm font-semibold text-mira-textPrimary mb-1">
                {t("containers.details.section.info")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-mira-textSecondary">
                    {t("containers.details.fields.image")}
                  </div>
                  <div className="text-mira-textPrimary break-all">{item.image}</div>
                </div>
                <div>
                  <div className="text-xs text-mira-textSecondary">
                    {t("containers.details.fields.uptime")}
                  </div>
                  <div className="text-mira-textPrimary">
                    {item.uptime || t("containers.details.fields.uptimeUnknown")}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-mira-textSecondary">
                    {t("containers.details.fields.cpu")}
                  </div>
                  <div className="text-mira-textPrimary">
                    {item.cpu_percent != null ? `${item.cpu_percent.toFixed(1)} %` : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-mira-textSecondary">
                    {t("containers.details.fields.memory")}
                  </div>
                  <div className="text-mira-textPrimary">
                    {item.memory_usage != null
                      ? `${(item.memory_usage / (1024 * 1024)).toFixed(1)} MiB`
                      : "—"}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-mira-border/60">
                <div className="text-xs text-mira-textSecondary mb-1">
                  {t("containers.details.fields.ports")}
                </div>
                {item.ports.length === 0 ? (
                  <div className="text-xs text-mira-textSecondary">No ports.</div>
                ) : (
                  <div className="flex flex-wrap gap-2 text-xs">
                    {item.ports.map((p, idx) => (
                      <span
                        key={idx}
                        className="
                          inline-flex items-center px-2 py-1 rounded-full
                          bg-slate-900/70 text-mira-textPrimary
                          border border-mira-border
                        "
                      >
                        {p.host_port != null ? `${p.host_port} → ` : ""}
                        {p.container_port}/{p.protocol}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "logs" && (
            <div className="bg-mira-panel border border-mira-border rounded-xl p-4 space-y-3 shadow-[0_0_40px_rgba(15,23,42,0.9)]">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-mira-textPrimary">
                  {t("containers.details.section.logs")}
                </h2>
                <button
                  onClick={loadLogs}
                  disabled={logsLoading}
                  className="
                    text-xs px-3 py-1 rounded-lg
                    bg-slate-900 text-mira-textPrimary
                    border border-mira-border
                    hover:bg-slate-800
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                  "
                >
                  {logsLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              {logsLoading && (
                <div className="text-xs text-mira-textSecondary">Loading logs...</div>
              )}

              {logsError && (
                <div className="bg-[#220815] border border-mira-danger rounded-lg p-3 text-xs text-mira-danger">
                  {logsError}
                </div>
              )}

              {!logsLoading && !logsError && (
                <pre className="max-h-[480px] overflow-auto text-xs bg-black/70 border border-mira-border rounded-lg p-3 text-mira-textPrimary font-mono whitespace-pre-wrap">
                  {logs || "No logs yet."}
                </pre>
              )}
            </div>
          )}

          <div className="text-xs text-mira-textSecondary flex items-center gap-1">
            <span>↩</span>
            <span>
              {t("containers.details.backHint")}{" "}
              <Link
                to="/containers"
                className="underline text-mira-neon hover:text-[#4BE3FF] transition-colors"
              >
                Containers
              </Link>
            </span>
          </div>
        </>
      )}
    </div>
  );
}
