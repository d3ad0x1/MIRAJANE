import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  fetchTemplates,
  deleteTemplate,
  getTemplatesExportUrl,
  importTemplates,
  type TemplateSummary,
} from "../../api/templatesApi";

export default function TemplatesListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState<TemplateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await fetchTemplates();
      setItems(data);
    } catch (e: any) {
      setErr(e.message || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this template?")) return;
    setBusyId(id);
    try {
      await deleteTemplate(id);
      await load();
    } catch (e: any) {
      alert(e.message || "Failed to delete template");
    } finally {
      setBusyId(null);
    }
  }

  function handleExport() {
    const url = getTemplatesExportUrl();
    window.open(url, "_blank");
  }

  function triggerImport() {
    fileInputRef.current?.click();
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      let json: any = JSON.parse(text);

      const templates: TemplateSummary[] = Array.isArray(json)
        ? json
        : Array.isArray(json.templates)
        ? json.templates
        : [];

      if (!templates.length) {
        throw new Error("No templates found in file");
      }

      await importTemplates(templates, "merge");
      await load();
      alert(`Imported ${templates.length} template(s).`);
    } catch (e: any) {
      alert(e.message || "Failed to import templates");
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImportFile}
      />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-mira-textPrimary drop-shadow-[0_0_14px_rgba(36,213,255,0.7)]">
            {t("templates.title")}
          </h1>
          <p className="text-xs text-mira-textSecondary">
            {t("templates.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="text-xs px-3 py-2 rounded-lg bg-slate-900 text-mira-textPrimary border border-mira-border hover:bg-slate-800"
          >
            Export JSON
          </button>
          <button
            onClick={triggerImport}
            disabled={importing}
            className="text-xs px-3 py-2 rounded-lg bg-slate-900 text-mira-textPrimary border border-mira-border hover:bg-slate-800 disabled:opacity-60"
          >
            {importing ? "Importing..." : "Import JSON"}
          </button>
          <button
            onClick={() => navigate("/templates/new")}
            className="text-xs px-3 py-2 rounded-lg bg-mira-neon text-slate-950 font-semibold hover:bg-[#4BE3FF] transition-colors shadow-mira-neon"
          >
            + New template
          </button>
        </div>
      </div>

      {loading && (
        <div className="bg-mira-panel border border-mira-border rounded-xl p-4 text-sm text-mira-textSecondary shadow-[0_0_28px_rgba(15,23,42,0.9)]">
          Loading templates...
        </div>
      )}

      {err && !loading && (
        <div className="bg-[#220815] border border-mira-danger rounded-xl p-4 text-sm text-mira-danger shadow-[0_0_24px_rgba(255,85,115,0.45)]">
          {err}
        </div>
      )}

      {!loading && !err && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((tpl) => (
            <div
              key={tpl.id}
              className="flex flex-col justify-between bg-mira-panel border border-mira-border rounded-xl p-4 shadow-[0_0_32px_rgba(15,23,42,0.9)]"
            >
              <div className="space-y-1">
                <div className="text-sm font-semibold text-mira-textPrimary">
                  {tpl.name}
                </div>
                <div className="text-xs text-mira-textSecondary font-mono">
                  {tpl.id}
                </div>
                <div className="text-xs text-mira-textSecondary">
                  {tpl.description}
                </div>
                <div className="text-xs text-mira-textSecondary mt-1">
                  Image:{" "}
                  <span className="text-mira-textPrimary">{tpl.image}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 mt-3 text-xs">
                <button
                  onClick={() =>
                    navigate(
                      `/containers/new?template=${encodeURIComponent(tpl.id)}`
                    )
                  }
                  className="text-mira-neon hover:text-[#4BE3FF]"
                >
                  {t("templates.card.use")} →
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/templates/${tpl.id}/edit`)}
                    className="px-2 py-1 rounded-md bg-slate-900 text-mira-textPrimary border border-mira-border hover:bg-slate-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tpl.id)}
                    disabled={busyId === tpl.id}
                    className="px-2 py-1 rounded-md border border-mira-danger text-mira-danger hover:bg-mira-danger/10 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-sm text-mira-textSecondary">
              No templates yet. Create one with “New template”.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
