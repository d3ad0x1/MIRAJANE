import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchNetworks,
  deleteNetwork,
  type NetworkSummary,
} from "../../api/networksApi";

export default function NetworksListPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState<NetworkSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await fetchNetworks();
      setItems(data);
    } catch (e: any) {
      setErr(e.message || "Failed to load networks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((n) => {
      const full = `${n.name} ${n.driver} ${n.scope ?? ""}`.toLowerCase();
      return full.includes(s) || n.id.toLowerCase().includes(s);
    });
  }, [items, q]);

  async function handleDelete(n: NetworkSummary) {
    if (["bridge", "host", "none"].includes(n.name)) {
      alert("System networks (bridge/host/none) cannot be deleted.");
      return;
    }
    if (
      !confirm(
        `Delete network "${n.name}"?\n\nID: ${n.id}\n\nAll disconnected containers will lose this network.`
      )
    ) {
      return;
    }

    setBusyId(n.id);
    try {
      await deleteNetwork(n.id);
      await load();
    } catch (e: any) {
      alert(e.message || "Failed to delete network");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-mira-textPrimary drop-shadow-[0_0_14px_rgba(36,213,255,0.7)]">
            Networks
          </h1>
          <p className="text-xs text-mira-textSecondary">
            Docker networks available on this host.
          </p>
        </div>

        <button
          onClick={() => navigate("/networks/new")}
          className="inline-flex items-center gap-2 rounded-lg bg-mira-neon px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-[#4BE3FF] shadow-mira-neon"
        >
          + New network
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, driver or ID..."
          className="w-full max-w-md bg-slate-950 border border-mira-border rounded-lg px-3 py-2 text-sm text-mira-textPrimary placeholder:text-mira-textSecondary/70 focus:outline-none focus:ring-2 focus:ring-mira-neon focus:border-mira-neon"
        />
        <div className="text-xs text-mira-textSecondary">
          {filtered.length} / {items.length}
        </div>
      </div>

      {loading && (
        <div className="bg-mira-panel border border-mira-border rounded-xl p-4 text-sm text-mira-textSecondary shadow-[0_0_28px_rgba(15,23,42,0.9)]">
          Loading networks...
        </div>
      )}

      {err && !loading && (
        <div className="bg-[#220815] border border-mira-danger rounded-xl p-4 text-sm text-mira-danger shadow-[0_0_24px_rgba(255,85,115,0.45)]">
          {err}
        </div>
      )}

      {!loading && !err && (
        <div className="border border-mira-border rounded-xl overflow-hidden bg-mira-panel shadow-[0_0_40px_rgba(15,23,42,0.9)]">
          <table className="w-full text-sm">
            <thead className="bg-slate-950/80 border-b border-mira-border">
              <tr className="text-left text-xs text-mira-textSecondary">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Driver</th>
                <th className="px-3 py-2">Scope</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((n) => (
                <tr
                  key={n.id}
                  className="border-b border-mira-border/60 last:border-b-0 hover:bg-slate-900/60"
                >
                  <td
                    className="px-3 py-2 text-mira-textPrimary cursor-pointer"
                    onClick={() =>
                      navigate(`/networks/${encodeURIComponent(n.id)}`)
                    }
                  >
                    {n.name}
                  </td>
                  <td className="px-3 py-2 text-mira-textSecondary font-mono text-xs">
                    {n.id.slice(0, 12)}
                  </td>
                  <td className="px-3 py-2 text-mira-textPrimary">
                    {n.driver}
                  </td>
                  <td className="px-3 py-2 text-mira-textSecondary text-xs">
                    {n.scope || "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      disabled={busyId === n.id}
                      onClick={() => handleDelete(n)}
                      className="inline-flex items-center gap-1 rounded-md border border-mira-danger px-2 py-1 text-[11px] text-mira-danger hover:bg-mira-danger/10 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-sm text-mira-textSecondary"
                  >
                    No networks found.
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
