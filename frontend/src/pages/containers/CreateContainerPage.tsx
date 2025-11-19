import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  createContainer,
  type ContainerCreatePayload,
} from "../../api/containersApi";
import { fetchTemplates, type TemplateSummary } from "../../api/templatesApi";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const RESTART_POLICIES = ["no", "on-failure", "unless-stopped", "always"];

export default function CreateContainerPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const query = useQuery();
  const templateId = query.get("template");

  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [loadingTpl, setLoadingTpl] = useState<boolean>(!!templateId);

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [restartPolicy, setRestartPolicy] = useState("unless-stopped");

  const [ports, setPorts] = useState<
    { host_port: string; container_port: string; protocol: string }[]
  >([]);
  const [env, setEnv] = useState<{ key: string; value: string }[]>([]);
  const [volumes, setVolumes] = useState<
    { volume_name: string; mountpoint: string; read_only: boolean }[]
  >([]);

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== Загрузка шаблонов и применение выбранного =====
  useEffect(() => {
    if (!templateId) {
      setLoadingTpl(false);
      return;
    }
    let cancelled = false;

    async function load() {
      setLoadingTpl(true);
      try {
        const data = await fetchTemplates();
        if (cancelled) return;

        setTemplates(data);
        const tpl = data.find((t) => t.id === templateId);
        if (tpl) {
          if (!name) setName(tpl.name.toLowerCase().replace(/\s+/g, "-"));
          if (!image) setImage(tpl.image);

          const tplPorts = tpl.default_ports ?? [];
          const tplEnv = tpl.default_env ?? {};
          const tplVolumes = tpl.default_volumes ?? [];

          setPorts(
            tplPorts.map((p) => ({
              host_port: p.host_port != null ? String(p.host_port) : "",
              container_port: String(p.container_port),
              protocol: p.protocol || "tcp",
            }))
          );

          setEnv(
            Object.entries(tplEnv).map(([k, v]) => ({
              key: k,
              value: v,
            }))
          );

          setVolumes(
            tplVolumes.map((v) => ({
              volume_name: v.volume_name,
              mountpoint: v.mountpoint,
              read_only: v.read_only,
            }))
          );
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Failed to load template");
      } finally {
        if (!cancelled) setLoadingTpl(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [templateId]);

  function addPortRow() {
    setPorts((prev) => [
      ...prev,
      { host_port: "", container_port: "", protocol: "tcp" },
    ]);
  }

  function addEnvRow() {
    setEnv((prev) => [...prev, { key: "", value: "" }]);
  }

  function addVolumeRow() {
    setVolumes((prev) => [
      ...prev,
      { volume_name: "", mountpoint: "", read_only: false },
    ]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);

    try {
      const payload: ContainerCreatePayload = {
        name: name.trim(),
        image: image.trim(),
        restart_policy: restartPolicy,
        ports: ports
          .filter((p) => p.container_port.trim())
          .map((p) => ({
            host_port: p.host_port.trim()
              ? Number(p.host_port.trim())
              : null,
            container_port: Number(p.container_port.trim()),
            protocol: p.protocol || "tcp",
          })),
        env: {},
        volumes: volumes
          .filter((v) => v.volume_name.trim() && v.mountpoint.trim())
          .map((v) => ({
            volume_name: v.volume_name.trim(),
            mountpoint: v.mountpoint.trim(),
            read_only: v.read_only,
          })),
      };

      env
        .filter((e) => e.key.trim())
        .forEach((e) => {
          payload.env[e.key.trim()] = e.value;
        });

      if (!payload.name || !payload.image) {
        throw new Error("Name and image are required");
      }

      await createContainer(payload);
      navigate("/containers");
    } catch (e: any) {
      setError(e.message || "Failed to create container");
    } finally {
      setCreating(false);
    }
  }

  const subtitle =
    templateId && templates.length
      ? (() => {
          const tpl = templates.find((t) => t.id === templateId);
          return tpl
            ? `${t("containers.create.fromTemplate")}: ${tpl.name}`
            : `${t("containers.create.fromTemplate")}: ${templateId}`;
        })()
      : t("containers.create.basic");

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">
            {t("containers.create.title")}
          </h1>
          <p className="text-sm text-slate-400">{subtitle}</p>
        </div>
      </div>

      {(loadingTpl || creating) && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-400">
          {loadingTpl ? "Loading template..." : "Creating container..."}
        </div>
      )}

      {error && (
        <div className="bg-rose-950/60 border border-rose-700 rounded-xl p-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Основные поля */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              {t("containers.create.fields.name")}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              {t("containers.create.fields.image")}
            </label>
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              {t("containers.create.fields.restart")}
            </label>
            <select
              value={restartPolicy}
              onChange={(e) => setRestartPolicy(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {RESTART_POLICIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Порты */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100">
              {t("containers.create.section.ports")}
            </h2>
            <button
              type="button"
              onClick={addPortRow}
              className="text-xs px-2 py-1 rounded-lg bg-slate-800 text-slate-100 hover:bg-slate-700"
            >
              + {t("containers.create.addPort")}
            </button>
          </div>
          <div className="space-y-2">
            {ports.map((p, idx) => (
              <div
                key={idx}
                className="grid grid-cols-3 gap-2 items-center text-xs"
              >
                <input
                  placeholder="Host port (optional)"
                  value={p.host_port}
                  onChange={(e) =>
                    setPorts((prev) =>
                      prev.map((row, i) =>
                        i === idx
                          ? { ...row, host_port: e.target.value }
                          : row
                      )
                    )
                  }
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-100"
                />
                <input
                  placeholder="Container port"
                  value={p.container_port}
                  onChange={(e) =>
                    setPorts((prev) =>
                      prev.map((row, i) =>
                        i === idx
                          ? { ...row, container_port: e.target.value }
                          : row
                      )
                    )
                  }
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-100"
                />
                <select
                  value={p.protocol}
                  onChange={(e) =>
                    setPorts((prev) =>
                      prev.map((row, i) =>
                        i === idx ? { ...row, protocol: e.target.value } : row
                      )
                    )
                  }
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-100"
                >
                  <option value="tcp">tcp</option>
                  <option value="udp">udp</option>
                </select>
              </div>
            ))}
            {ports.length === 0 && (
              <div className="text-xs text-slate-500">
                No ports configured.
              </div>
            )}
          </div>
        </div>

        {/* ENV */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100">
              {t("containers.create.section.env")}
            </h2>
            <button
              type="button"
              onClick={addEnvRow}
              className="text-xs px-2 py-1 rounded-lg bg-slate-800 text-slate-100 hover:bg-slate-700"
            >
              + {t("containers.create.addEnv")}
            </button>
          </div>
          <div className="space-y-2">
            {env.map((eRow, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-2 text-xs">
                <input
                  placeholder="KEY"
                  value={eRow.key}
                  onChange={(e) =>
                    setEnv((prev) =>
                      prev.map((row, i) =>
                        i === idx ? { ...row, key: e.target.value } : row
                      )
                    )
                  }
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-100"
                />
                <input
                  placeholder="value"
                  value={eRow.value}
                  onChange={(e) =>
                    setEnv((prev) =>
                      prev.map((row, i) =>
                        i === idx ? { ...row, value: e.target.value } : row
                      )
                    )
                  }
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-100"
                />
              </div>
            ))}
            {env.length === 0 && (
              <div className="text-xs text-slate-500">
                No environment variables.
              </div>
            )}
          </div>
        </div>

        {/* Volumes */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100">
              {t("containers.create.section.volumes")}
            </h2>
            <button
              type="button"
              onClick={addVolumeRow}
              className="text-xs px-2 py-1 rounded-lg bg-slate-800 text-slate-100 hover:bg-slate-700"
            >
              + {t("containers.create.addVolume")}
            </button>
          </div>
          <div className="space-y-2 text-xs">
            {volumes.map((v, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[1.2fr,1.5fr,auto] gap-2 items-center"
              >
                <input
                  placeholder="Volume name"
                  value={v.volume_name}
                  onChange={(e) =>
                    setVolumes((prev) =>
                      prev.map((row, i) =>
                        i === idx
                          ? { ...row, volume_name: e.target.value }
                          : row
                      )
                    )
                  }
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-100"
                />
                <input
                  placeholder="/mount/path"
                  value={v.mountpoint}
                  onChange={(e) =>
                    setVolumes((prev) =>
                      prev.map((row, i) =>
                        i === idx
                          ? { ...row, mountpoint: e.target.value }
                          : row
                      )
                    )
                  }
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-100"
                />
                <label className="inline-flex items-center gap-1 text-slate-300">
                  <input
                    type="checkbox"
                    checked={v.read_only}
                    onChange={(e) =>
                      setVolumes((prev) =>
                        prev.map((row, i) =>
                          i === idx
                            ? { ...row, read_only: e.target.checked }
                            : row
                        )
                      )
                    }
                    className="rounded border-slate-600 bg-slate-950"
                  />
                  ro
                </label>
              </div>
            ))}
            {volumes.length === 0 && (
              <div className="text-xs text-slate-500">No volumes.</div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/containers")}
            className="px-3 py-2 text-xs rounded-lg bg-slate-800 text-slate-100 hover:bg-slate-700"
          >
            {t("containers.create.cancel")}
          </button>
          <button
            type="submit"
            disabled={creating}
            className="px-3 py-2 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {t("containers.create.create")}
          </button>
        </div>
      </form>
    </div>
  );
}
