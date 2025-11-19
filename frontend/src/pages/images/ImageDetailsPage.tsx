import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchImage, deleteImage, type ImageDetail } from "../../api/imagesApi";

export default function ImageDetailsPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<ImageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busyDelete, setBusyDelete] = useState(false);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await fetchImage(id);
      setItem(data);
    } catch (e: any) {
      setErr(e.message || "Failed to load image");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleDelete() {
    if (
      !window.confirm(
        "Удалить этот образ? Все контейнеры на основе этого образа должны быть остановлены."
      )
    )
      return;

    setBusyDelete(true);
    try {
      await deleteImage(id, true);
      navigate("/images");
    } catch (e: any) {
      alert(e.message || "Failed to delete image");
    } finally {
      setBusyDelete(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* top bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          className="inline-flex items-center gap-2 text-xs text-mira-textSecondary hover:text-mira-textPrimary transition-colors"
          onClick={() => navigate("/images")}
        >
          ← Назад к образам
        </button>

        <button
          onClick={handleDelete}
          disabled={busyDelete}
          className="px-3 py-1 text-xs rounded-lg border border-mira-danger text-mira-danger hover:bg-mira-danger/10 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_18px_rgba(248,113,113,0.35)]"
        >
          Удалить образ
        </button>
      </div>

      {loading && (
        <div className="bg-mira-panel border border-mira-border rounded-xl p-4 text-sm text-mira-textSecondary shadow-[0_0_28px_rgba(15,23,42,0.9)]">
          Загрузка образа...
        </div>
      )}

      {err && !loading && (
        <div className="bg-[#220815] border border-mira-danger rounded-xl p-4 text-sm text-mira-danger shadow-[0_0_24px_rgba(255,85,115,0.45)]">
          {err}
        </div>
      )}

      {!loading && !err && item && (
        <>
          {/* title */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-mira-textPrimary drop-shadow-[0_0_14px_rgba(36,213,255,0.7)]">
                {item.repo_tags[0] || "<none>:<none>"}
              </h1>
              <p className="text-xs text-mira-textSecondary mt-1">
                ID:{" "}
                <span className="font-mono text-[11px] text-slate-300">
                  {item.id}
                </span>
              </p>
            </div>
          </div>

          {/* info block */}
          <div className="bg-mira-panel border border-mira-border rounded-xl p-4 space-y-3 shadow-[0_0_30px_rgba(15,23,42,0.9)]">
            <h2 className="text-sm font-semibold text-mira-textPrimary mb-2">
              Информация об образе
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-mira-textSecondary">Теги</div>
                <div className="text-mira-textPrimary text-xs">
                  {item.repo_tags.length
                    ? item.repo_tags.join(", ")
                    : "<none>:<none>"}
                </div>
              </div>
              <div>
                <div className="text-xs text-mira-textSecondary">Размер</div>
                <div className="text-mira-textPrimary">
                  {(item.size_bytes / (1024 * 1024)).toFixed(1)} MB
                </div>
              </div>
              <div>
                <div className="text-xs text-mira-textSecondary">
                  Virtual size
                </div>
                <div className="text-mira-textPrimary">
                  {item.virtual_size_bytes
                    ? `${(item.virtual_size_bytes / (1024 * 1024)).toFixed(
                        1
                      )} MB`
                    : "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-mira-textSecondary">Создан</div>
                <div className="text-mira-textPrimary text-xs">
                  {item.created}
                </div>
              </div>
            </div>
          </div>

          {/* containers using this image */}
          <div className="bg-mira-panel border border-mira-border rounded-xl p-4 space-y-3 shadow-[0_0_30px_rgba(15,23,42,0.9)]">
            <h2 className="text-sm font-semibold text-mira-textPrimary mb-2">
              Контейнеры на основе образа
            </h2>
            {item.containers.length === 0 ? (
              <div className="text-xs text-mira-textSecondary">
                Нет контейнеров, использующих этот образ.
              </div>
            ) : (
              <div className="border border-mira-border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-950/80 border-b border-mira-border">
                    <tr className="text-left text-[11px] text-mira-textSecondary">
                      <th className="px-3 py-2">Имя</th>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Состояние</th>
                      <th className="px-3 py-2">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.containers.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-mira-border/60 last:border-b-0 hover:bg-slate-900/60"
                      >
                        <td className="px-3 py-2 text-mira-textPrimary">
                          <Link
                            to={`/containers/${encodeURIComponent(c.id)}`}
                            className="text-mira-neon hover:text-[#4BE3FF]"
                          >
                            {c.name}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-mira-textSecondary font-mono">
                          {c.id.slice(0, 12)}
                        </td>
                        <td className="px-3 py-2 text-mira-textPrimary">
                          {c.state}
                        </td>
                        <td className="px-3 py-2 text-mira-textPrimary">
                          {c.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* labels */}
          <div className="bg-mira-panel border border-mira-border rounded-xl p-4 space-y-3 shadow-[0_0_30px_rgba(15,23,42,0.9)]">
            <h2 className="text-sm font-semibold text-mira-textPrimary mb-2">
              Labels (Docker метки)
            </h2>
            {Object.keys(item.labels).length === 0 ? (
              <div className="text-xs text-mira-textSecondary">
                Метки отсутствуют.
              </div>
            ) : (
              <div className="space-y-1 text-xs font-mono text-mira-textPrimary">
                {Object.entries(item.labels).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-mira-textSecondary">{k}:</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
