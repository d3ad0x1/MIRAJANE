import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  fetchNetwork,
  type NetworkDetail,
} from "../../api/networksApi";

export default function NetworkDetailsPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<NetworkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await fetchNetwork(id);
      setItem(data);
    } catch (e: any) {
      setErr(e.message || "Failed to load network");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <button
          className="inline-flex items-center gap-2 text-xs text-mira-textSecondary hover:text-mira-textPrimary"
          onClick={() => navigate("/networks")}
        >
          ← Back to networks
        </button>
      </div>

      {loading && (
        <div className="bg-mira-panel border border-mira-border rounded-xl p-4 text-sm text-mira-textSecondary shadow-[0_0_28px_rgba(15,23,42,0.9)]">
          Loading network...
        </div>
      )}

      {err && !loading && (
        <div className="bg-[#220815] border border-mira-danger rounded-xl p-4 text-sm text-mira-danger shadow-[0_0_24px_rgba(255,85,115,0.45)]">
          {err}
        </div>
      )}

      {!loading && !err && item && (
        <>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-mira-textPrimary drop-shadow-[0_0_14px_rgba(36,213,255,0.7)]">
                {item.name}
              </h1>
              <p className="text-xs text-mira-textSecondary mt-1">
                ID:{" "}
                <span className="font-mono text-[11px] text-slate-300">
                  {item.id}
                </span>
              </p>
            </div>
          </div>

          {/* Основная информация */}
          <div className="bg-mira-panel border border-mira-border rounded-xl p-4 space-y-3 shadow-[0_0_30px_rgba(15,23,42,0.9)]">
            <h2 className="text-sm font-semibold text-mira-textPrimary mb-2">
              Network info
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-mira-textSecondary">Name</div>
                <div className="text-mira-textPrimary">{item.name}</div>
              </div>
              <div>
                <div className="text-xs text-mira-textSecondary">Driver</div>
                <div className="text-mira-textPrimary">{item.driver}</div>
              </div>
              <div>
                <div className="text-xs text-mira-textSecondary">Scope</div>
                <div className="text-mira-textPrimary">
                  {item.scope || "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Контейнеры в сети */}
          <div className="bg-mira-panel border border-mira-border rounded-xl p-4 space-y-3 shadow-[0_0_30px_rgba(15,23,42,0.9)]">
            <h2 className="text-sm font-semibold text-mira-textPrimary mb-2">
              Containers in this network
            </h2>
            {item.containers.length === 0 ? (
              <div className="text-xs text-mira-textSecondary">
                No containers attached.
              </div>
            ) : (
              <div className="border border-mira-border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-950/80 border-b border-mira-border">
                    <tr className="text-left text-[11px] text-mira-textSecondary">
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">IPv4</th>
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
                          {c.ipv4_address || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Labels */}
          <div className="bg-mira-panel border border-mira-border rounded-xl p-4 space-y-3 shadow-[0_0_30px_rgba(15,23,42,0.9)]">
            <h2 className="text-sm font-semibold text-mira-textPrimary mb-2">
              Labels
            </h2>
            {Object.keys(item.labels).length === 0 ? (
              <div className="text-xs text-mira-textSecondary">
                No labels.
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
