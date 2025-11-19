import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  fetchTemplate,
  createTemplate,
  updateTemplatePut,
  type TemplateSummary,
} from "../../api/templatesApi";

function useIsNew() {
  const params = useParams();
  return !params.id;
}

export default function TemplateEditorPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const isNew = useIsNew();
  const templateId = params.id || "";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tpl, setTpl] = useState<TemplateSummary>({
    id: "",
    name: "",
    description: "",
    image: "",
    default_ports: [],
    default_env: {},
    default_volumes: [],
  });

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await fetchTemplate(templateId);

        const normalized: TemplateSummary = {
          id: data.id ?? "",
          name: data.name ?? "",
          description: data.description ?? "",
          image: data.image ?? "",
          default_ports: Array.isArray(data.default_ports)
            ? data.default_ports
            : [],
          default_env: data.default_env ?? {},
          default_volumes: Array.isArray(data.default_volumes)
            ? data.default_volumes
            : [],
        };

        if (!cancelled) setTpl(normalized);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Failed to load template");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isNew, templateId]);

  function update<K extends keyof TemplateSummary>(
    key: K,
    value: TemplateSummary[K]
  ) {
    setTpl((prev) => ({ ...prev, [key]: value }));
  }

  function addPort() {
    update("default_ports", [
      ...(tpl.default_ports ?? []),
      { host_port: null, container_port: 80, protocol: "tcp" },
    ]);
  }

  function addVolume() {
    update("default_volumes", [
      ...(tpl.default_volumes ?? []),
      { volume_name: "", mountpoint: "", read_only: false },
    ]);
  }

  const envEntries = useMemo(
    () => Object.entries(tpl.default_env || {}),
    [tpl.default_env]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (!tpl.id.trim() || !tpl.name.trim() || !tpl.image.trim()) {
        throw new Error("ID, name and image are required");
      }

      const normalized: TemplateSummary = {
        ...tpl,
        id: tpl.id.trim(),
        name: tpl.name.trim(),
        description: (tpl.description || "").trim(),
        image: tpl.image.trim(),
        default_ports: (tpl.default_ports || []).map((p) => ({
          host_port: p.host_port,
          container_port: Number(p.container_port),
          protocol: p.protocol || "tcp",
        })),
        default_env: tpl.default_env || {},
        default_volumes: (tpl.default_volumes || []).map((v) => ({
          volume_name: v.volume_name,
          mountpoint: v.mountpoint,
          read_only: !!v.read_only,
        })),
      };

      if (isNew) {
        await createTemplate(normalized);
      } else {
        await updateTemplatePut(templateId, normalized);
      }

      navigate("/templates");
    } catch (e: any) {
      setError(e.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-mira-textPrimary drop-shadow-[0_0_14px_rgba(36,213,255,0.7)]">
            {isNew ? "New template" : `Edit template: ${tpl.id}`}
          </h1>
        </div>
      </div>

      {(loading || saving) && (
        <div className="bg-mira-panel border border-mira-border rounded-xl p-3 text-sm text-mira-textSecondary shadow-[0_0_28px_rgba(15,23,42,0.9)]">
          {loading ? "Loading template..." : "Saving template..."}
        </div>
      )}

      {error && (
        <div className="bg-[#220815] border border-mira-danger rounded-xl p-3 text-sm text-mira-danger shadow-[0_0_24px_rgba(255,85,115,0.45)]">
          {error}
        </div>
      )}

      {!loading && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Основное */}
          <div className="bg-mira-panel border border-mira-border rounded-xl p-4 space-y-3 shadow-[0_0_30px_rgba(15,23,42,0.9)]">
            <div>
              <label className="block text-xs text-mira-textSecondary mb-1">
                ID
              </label>
              <input
                value={tpl.id}
                onChange={(e) => update("id", e.target.value)}
                disabled={!isNew}
                className="w-full bg-slate-950 border border-mira-border rounded-lg px-3 py-2 text-sm text-mira-textPrimary disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-mira-neon focus:border-mira-neon"
              />
              <p className="text-[10px] text-mira-textSecondary mt-1">
                Used as template identifier (must be unique).
              </p>
            </div>

            <div>
              <label className="block text-xs text-mira-textSecondary mb-1">
                Name
              </label>
              <input
                value={tpl.name}
                onChange={(e) => update("name", e.target.value)}
                className="w-full bg-slate-950 border border-mira-border rounded-lg px-3 py-2 text-sm text-mira-textPrimary focus:outline-none focus:ring-2 focus:ring-mira-neon focus:border-mira-neon"
              />
            </div>

            <div>
              <label className="block text-xs text-mira-textSecondary mb-1">
                Description
              </label>
              <textarea
                value={tpl.description}
                onChange={(e) => update("description", e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-mira-border rounded-lg px-3 py-2 text-sm text-mira-textPrimary focus:outline-none focus:ring-2 focus:ring-mira-neon focus:border-mira-neon"
              />
            </div>

            <div>
              <label className="block text-xs text-mira-textSecondary mb-1">
                Image
              </label>
              <input
                value={tpl.image}
                onChange={(e) => update("image", e.target.value)}
                className="w-full bg-slate-950 border border-mira-border rounded-lg px-3 py-2 text-sm text-mira-textPrimary focus:outline-none focus:ring-2 focus:ring-mira-neon focus:border-mira-neon"
              />
            </div>
          </div>

          {/* Порты */}
          <div className="bg-mira-panel border border-mira-border rounded-xl p-4 space-y-3 shadow-[0_0_30px_rgba(15,23,42,0.9)]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-mira-textPrimary">
                Default ports
              </h2>
              <button
                type="button"
                onClick={addPort}
                className="text-xs px-2 py-1 rounded-lg bg-slate-900 text-mira-textPrimary border border-mira-border hover:bg-slate-800"
              >
                + Add port
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {(tpl.default_ports || []).map((p, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-3 gap-2 items-center"
                >
                  <input
                    placeholder="Host port (optional)"
                    value={p.host_port ?? ""}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      const num = value ? Number(value) : null;
                      const copy = [...(tpl.default_ports || [])];
                      copy[idx] = {
                        ...copy[idx],
                        host_port: Number.isNaN(num) ? null : num,
                      };
                      update("default_ports", copy);
                    }}
                    className="bg-slate-950 border border-mira-border rounded-lg px-2 py-1 text-mira-textPrimary"
                  />
                  <input
                    placeholder="Container port"
                    value={p.container_port}
                    onChange={(e) => {
                      const copy = [...(tpl.default_ports || [])];
                      copy[idx] = {
                        ...copy[idx],
                        container_port: Number(e.target.value) || 0,
                      };
                      update("default_ports", copy);
                    }}
                    className="bg-slate-950 border border-mira-border rounded-lg px-2 py-1 text-mira-textPrimary"
                  />
                  <select
                    value={p.protocol}
                    onChange={(e) => {
                      const copy = [...(tpl.default_ports || [])];
                      copy[idx] = { ...copy[idx], protocol: e.target.value };
                      update("default_ports", copy);
                    }}
                    className="bg-slate-950 border border-mira-border rounded-lg px-2 py-1 text-mira-textPrimary"
                  >
                    <option value="tcp">tcp</option>
                    <option value="udp">udp</option>
                  </select>
                </div>
              ))}
              {(tpl.default_ports || []).length === 0 && (
                <div className="text-xs text-mira-textSecondary">No ports.</div>
              )}
            </div>
          </div>

          {/* ENV */}
          <div className="bg-mira-panel border border-mira-border rounded-xl p-4 space-y-3 shadow-[0_0_30px_rgba(15,23,42,0.9)]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-mira-textPrimary">
                Default environment
              </h2>
              <button
                type="button"
                onClick={() =>
                  update("default_env", {
                    ...(tpl.default_env || {}),
                    "": "",
                  })
                }
                className="text-xs px-2 py-1 rounded-lg bg-slate-900 text-mira-textPrimary border border-mira-border hover:bg-slate-800"
              >
                + Add variable
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {envEntries.map(([k, v], idx) => (
                <div key={idx} className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="KEY"
                    value={k}
                    onChange={(e) => {
                      const newKey = e.target.value;
                      const entries = [...envEntries];
                      entries[idx] = [newKey, v];
                      const obj: Record<string, string> = {};
                      entries.forEach(([kk, vv]) => {
                        if (kk.trim()) obj[kk.trim()] = vv;
                      });
                      update("default_env", obj);
                    }}
                    className="bg-slate-950 border border-mira-border rounded-lg px-2 py-1 text-mira-textPrimary"
                  />
                  <input
                    placeholder="value"
                    value={v}
                    onChange={(e) => {
                      const newVal = e.target.value;
                      const entries = [...envEntries];
                      entries[idx] = [k, newVal];
                      const obj: Record<string, string> = {};
                      entries.forEach(([kk, vv]) => {
                        if (kk.trim()) obj[kk.trim()] = vv;
                      });
                      update("default_env", obj);
                    }}
                    className="bg-slate-950 border border-mira-border rounded-lg px-2 py-1 text-mira-textPrimary"
                  />
                </div>
              ))}
              {envEntries.length === 0 && (
                <div className="text-xs text-mira-textSecondary">
                  No environment variables.
                </div>
              )}
            </div>
          </div>

          {/* Томa */}
          <div className="bg-mira-panel border border-mira-border rounded-xl p-4 space-y-3 shadow-[0_0_30px_rgba(15,23,42,0.9)]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-mira-textPrimary">
                Default volumes
              </h2>
              <button
                type="button"
                onClick={addVolume}
                className="text-xs px-2 py-1 rounded-lg bg-slate-900 text-mira-textPrimary border border-mira-border hover:bg-slate-800"
              >
                + Add volume
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {(tpl.default_volumes || []).map((v, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[1.2fr,1.5fr,auto] gap-2 items-center"
                >
                  <input
                    placeholder="Volume name"
                    value={v.volume_name}
                    onChange={(e) => {
                      const copy = [...(tpl.default_volumes || [])];
                      copy[idx] = {
                        ...copy[idx],
                        volume_name: e.target.value,
                      };
                      update("default_volumes", copy);
                    }}
                    className="bg-slate-950 border border-mira-border rounded-lg px-2 py-1 text-mira-textPrimary"
                  />
                  <input
                    placeholder="/mount/path"
                    value={v.mountpoint}
                    onChange={(e) => {
                      const copy = [...(tpl.default_volumes || [])];
                      copy[idx] = {
                        ...copy[idx],
                        mountpoint: e.target.value,
                      };
                      update("default_volumes", copy);
                    }}
                    className="bg-slate-950 border border-mira-border rounded-lg px-2 py-1 text-mira-textPrimary"
                  />
                  <label className="inline-flex items-center gap-1 text-mira-textPrimary">
                    <input
                      type="checkbox"
                      checked={v.read_only}
                      onChange={(e) => {
                        const copy = [...(tpl.default_volumes || [])];
                        copy[idx] = {
                          ...copy[idx],
                          read_only: e.target.checked,
                        };
                        update("default_volumes", copy);
                      }}
                      className="rounded border-slate-600 bg-slate-950"
                    />
                    ro
                  </label>
                </div>
              ))}
              {(tpl.default_volumes || []).length === 0 && (
                <div className="text-xs text-mira-textSecondary">No volumes.</div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate("/templates")}
              className="px-3 py-2 text-xs rounded-lg bg-slate-900 text-mira-textPrimary border border-mira-border hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-2 text-xs rounded-lg bg-mira-neon text-slate-950 font-semibold hover:bg-[#4BE3FF] disabled:opacity-60 disabled:cursor-not-allowed shadow-mira-neon"
            >
              Save template
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
