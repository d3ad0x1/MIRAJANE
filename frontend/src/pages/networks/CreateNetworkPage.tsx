import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { createNetwork } from "../../api/networksApi";

export default function CreateNetworkPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [driver, setDriver] = useState("bridge");
  const [internal, setInternal] = useState(false);
  const [attachable, setAttachable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (!name.trim()) {
        throw new Error("Name required");
      }
      await createNetwork({
        name: name.trim(),
        driver: driver || "bridge",
        internal,
        attachable,
      });
      navigate("/networks");
    } catch (e: any) {
      setError(e.message || "Failed to create network");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 max-w-xl">
      <div>
        <h1 className="text-xl font-semibold text-mira-textPrimary drop-shadow-[0_0_14px_rgba(36,213,255,0.7)]">
          {t("networks.create.title")}
        </h1>
      </div>

      {error && (
        <div className="bg-[#220815] border border-mira-danger rounded-xl p-3 text-sm text-mira-danger shadow-[0_0_24px_rgba(255,85,115,0.45)]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-mira-panel border border-mira-border rounded-xl p-4 space-y-3 shadow-[0_0_30px_rgba(15,23,42,0.9)]">
          <div>
            <label className="block text-xs text-mira-textSecondary mb-1">
              {t("networks.create.name")}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-mira-border rounded-lg px-3 py-2 text-sm text-mira-textPrimary placeholder:text-mira-textSecondary/70 focus:outline-none focus:ring-2 focus:ring-mira-neon focus:border-mira-neon"
            />
          </div>
          <div>
            <label className="block text-xs text-mira-textSecondary mb-1">
              {t("networks.create.driver")}
            </label>
            <select
              value={driver}
              onChange={(e) => setDriver(e.target.value)}
              className="w-full bg-slate-950 border border-mira-border rounded-lg px-3 py-2 text-sm text-mira-textPrimary focus:outline-none focus:ring-2 focus:ring-mira-neon focus:border-mira-neon"
            >
              <option value="bridge">bridge</option>
              <option value="overlay">overlay</option>
              <option value="macvlan">macvlan</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs text-mira-textPrimary">
            <input
              type="checkbox"
              checked={internal}
              onChange={(e) => setInternal(e.target.checked)}
              className="rounded border-slate-600 bg-slate-950"
            />
            {t("networks.create.internal")}
          </label>
          <label className="flex items-center gap-2 text-xs text-mira-textPrimary">
            <input
              type="checkbox"
              checked={attachable}
              onChange={(e) => setAttachable(e.target.checked)}
              className="rounded border-slate-600 bg-slate-950"
            />
            {t("networks.create.attachable")}
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/networks")}
            className="px-3 py-2 text-xs rounded-lg bg-slate-900 text-mira-textPrimary border border-mira-border hover:bg-slate-800"
          >
            {t("networks.create.cancel")}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-3 py-2 text-xs rounded-lg bg-mira-neon text-slate-950 font-semibold hover:bg-[#4BE3FF] disabled:opacity-60 disabled:cursor-not-allowed shadow-mira-neon"
          >
            {t("networks.create.create")}
          </button>
        </div>
      </form>
    </div>
  );
}
