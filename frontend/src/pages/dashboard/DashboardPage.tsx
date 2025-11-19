import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

// ВАЖНО: путь из папки pages/dashboard до api — через "../../"
import { fetchContainers } from "../../api/containersApi";
import { fetchImages } from "../../api/imagesApi";
import { fetchVolumes } from "../../api/volumesApi";

interface Counts {
  containers: number;
  images: number;
  volumes: number;
}

export default function DashboardPage() {
  const { t } = useTranslation();

  const [counts, setCounts] = useState<Counts>({
    containers: 0,
    images: 0,
    volumes: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // Используем те же helper’ы, что уже работают на других страницах
        const [containers, images, volumes] = await Promise.all([
          fetchContainers(),
          fetchImages(),
          fetchVolumes(),
        ]);

        if (cancelled) return;

        setCounts({
          containers: Array.isArray(containers) ? containers.length : 0,
          images: Array.isArray(images) ? images.length : 0,
          volumes: Array.isArray(volumes) ? volumes.length : 0,
        });
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message || "Failed to load dashboard data");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-100">
        {t("dashboard.title")}
      </h1>
      <p className="text-sm text-slate-400">
        {t("dashboard.subtitle")}
      </p>

      {loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-400">
          Loading Docker stats...
        </div>
      )}

      {error && !loading && (
        <div className="bg-rose-950/60 border border-rose-700 rounded-xl p-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">
            {t("dashboard.cards.containers.title")}
          </div>
          <div className="text-2xl font-bold text-slate-50 mt-1">
            {counts.containers}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {t("dashboard.cards.containers.text")}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">
            {t("dashboard.cards.images.title")}
          </div>
          <div className="text-2xl font-bold text-slate-50 mt-1">
            {counts.images}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {t("dashboard.cards.images.text")}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">
            {t("dashboard.cards.volumes.title")}
          </div>
          <div className="text-2xl font-bold text-slate-50 mt-1">
            {counts.volumes}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {t("dashboard.cards.volumes.text")}
          </div>
        </div>
      </div>
    </div>
  );
}
