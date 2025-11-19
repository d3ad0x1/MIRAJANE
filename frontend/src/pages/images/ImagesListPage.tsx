import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchImages, type ImageSummary } from "../../api/imagesApi";

function formatSize(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let val = bytes;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(1)} ${units[i]}`;
}

export default function ImagesListPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<ImageSummary[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const data = await fetchImages();
        if (!cancelled) setItems(data);
      } catch (e: any) {
        if (!cancelled) setErr(e.message || "Failed to load images");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((img) => {
      const repo = (img.repo_tags[0] || "").toLowerCase();
      return repo.includes(q) || img.id.toLowerCase().includes(q);
    });
  }, [search, items]);

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-mira-textPrimary drop-shadow-[0_0_14px_rgba(36,213,255,0.7)]">
            {t("images.title")}
          </h1>
          <p className="text-xs text-mira-textSecondary">
            {t("images.subtitle")}
          </p>
        </div>
      </div>

      {/* search + счетчик */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("containers.search.placeholder")}
            className="
              w-full bg-slate-950/80 border border-mira-border rounded-lg
              px-3 py-2 text-sm text-mira-textPrimary
              placeholder:text-mira-textSecondary/70
              focus:outline-none focus:ring-2 focus:ring-mira-neon focus:border-mira-neon
              shadow-[0_0_18px_rgba(15,23,42,0.9)]
            "
          />
        </div>
        <div className="text-xs text-mira-textSecondary">
          {filtered.length} / {items.length}
        </div>
      </div>

      {/* states */}
      {loading && (
        <div className="bg-mira-panel border border-mira-border rounded-xl p-4 text-sm text-mira-textSecondary shadow-[0_0_28px_rgba(15,23,42,0.9)]">
          Loading images...
        </div>
      )}

      {err && !loading && (
        <div className="bg-[#220815] border border-mira-danger rounded-xl p-4 text-sm text-mira-danger shadow-[0_0_24px_rgba(255,85,115,0.45)]">
          {err}
        </div>
      )}

      {/* таблица */}
      {!loading && !err && (
        <div className="border border-mira-border rounded-xl overflow-hidden bg-mira-panel shadow-[0_0_40px_rgba(15,23,42,0.9)]">
          <table className="w-full text-sm">
            <thead className="bg-slate-950/80 border-b border-mira-border">
              <tr className="text-left text-xs text-mira-textSecondary">
                <th className="px-3 py-2">
                  {t("images.table.headers.repo")}
                </th>
                <th className="px-3 py-2">
                  {t("images.table.headers.id")}
                </th>
                <th className="px-3 py-2 w-32">
                  {t("images.table.headers.size")}
                </th>
                <th className="px-3 py-2 w-40">
                  {t("images.table.headers.created")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((img) => (
                <tr
                  key={img.id}
                  className="
                    border-b border-mira-border/60 last:border-b-0
                    hover:bg-slate-900/70 transition-colors
                  "
                >
                  <td className="px-3 py-2 align-middle text-mira-textPrimary">
                    {img.repo_tags.length
                      ? img.repo_tags.join(", ")
                      : "<none>:<none>"}
                  </td>
                  <td className="px-3 py-2 align-middle text-mira-textSecondary font-mono">
                    {img.id.slice(7, 19)}
                  </td>
                  <td className="px-3 py-2 align-middle text-mira-textPrimary">
                    {formatSize(img.size)}
                  </td>
                  <td className="px-3 py-2 align-middle text-mira-textPrimary">
                    {img.created_at
                      ? new Date(img.created_at).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-sm text-mira-textSecondary"
                  >
                    No images found.
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
