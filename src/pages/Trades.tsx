import { useState } from "react";
import { useTrades, useDeleteTrade } from "../api/hooks";
import { analyzeTrade } from "../api";
import { Layout } from "../components/Layout";
import { AnalysisModal } from "../components/AnalysisModal";

export function Trades() {
  const [symbolFilter, setSymbolFilter] = useState("");
  const [directionFilter, setDirectionFilter] = useState("");
  const { data: trades, isLoading } = useTrades({
    ...(symbolFilter ? { symbol: symbolFilter } : {}),
    ...(directionFilter ? { direction: directionFilter } : {}),
    limit: "100",
  });
  const deleteTrade = useDeleteTrade();
  const [analysisContent, setAnalysisContent] = useState("");
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisTradeId, setAnalysisTradeId] = useState<number | null>(null);

  const fmt = (n: number | undefined | null) => {
    if (n == null) return "-";
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <Layout>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 24, fontWeight: 600 }}>Trades</h2>
        <a
          href="/trades/new"
          style={{
            padding: "10px 20px",
            background: "var(--accent)",
            color: "#fff",
            borderRadius: 8,
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          + New Trade
        </a>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <input
          placeholder="Filter by symbol..."
          value={symbolFilter}
          onChange={(e) => setSymbolFilter(e.target.value)}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            fontSize: 14,
            flex: 1,
            outline: "none",
          }}
        />
        <select
          value={directionFilter}
          onChange={(e) => setDirectionFilter(e.target.value)}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            fontSize: 14,
            outline: "none",
          }}
        >
          <option value="">All directions</option>
          <option value="long">Long</option>
          <option value="short">Short</option>
        </select>
      </div>

      {isLoading ? (
        <p style={{ color: "var(--text-secondary)" }}>Loading trades...</p>
      ) : trades && trades.length > 0 ? (
        <div
          style={{
            background: "var(--bg-card)",
            borderRadius: 12,
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Symbol", "Direction", "Entry", "Exit", "P&L", "Strategy", "Tags", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "12px 16px",
                        color: "var(--text-secondary)",
                        fontWeight: 500,
                        fontSize: 12,
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr
                  key={t.id}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td style={{ padding: "12px 16px", fontWeight: 600 }}>
                    {t.symbol}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        color:
                          t.direction === "long"
                            ? "var(--green)"
                            : "var(--red)",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {t.direction.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
                    ${fmt(t.entry_price)}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
                    {t.exit_price ? `$${fmt(t.exit_price)}` : "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontWeight: 600,
                      color:
                        t.pnl && t.pnl >= 0 ? "var(--green)" : "var(--red)",
                    }}
                  >
                    {t.pnl != null ? `${t.pnl >= 0 ? "+" : ""}$${fmt(t.pnl)}` : "-"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
                    {t.strategy?.name || "-"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {t.tags.map((tag) => (
                        <span
                          key={tag.id}
                          style={{
                            padding: "2px 8px",
                            background: "var(--accent)",
                            borderRadius: 4,
                            fontSize: 11,
                            color: "#fff",
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <a
                        href={`/trades/${t.id}/edit`}
                        style={{
                          color: "var(--accent)",
                          textDecoration: "none",
                          fontSize: 13,
                        }}
                      >
                        Edit
                      </a>
                      <button
                        onClick={() => {
                          setAnalysisTradeId(t.id);
                          setAnalysisLoading(true);
                          setAnalysisContent("");
                          analyzeTrade(t.id)
                            .then((res) => setAnalysisContent(res.analysis))
                            .catch((err) =>
                              setAnalysisContent(
                                err instanceof Error
                                  ? err.message
                                  : "Analysis failed"
                              )
                            )
                            .finally(() => setAnalysisLoading(false));
                        }}
                        style={{
                          color: "var(--green)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 13,
                        }}
                      >
                        Analyze
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this trade?")) {
                            deleteTrade.mutate(t.id);
                          }
                        }}
                        style={{
                          color: "var(--red)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 13,
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ color: "var(--text-secondary)" }}>
          No trades found.{" "}
          <a
            href="/trades/new"
            style={{ color: "var(--accent)", textDecoration: "none" }}
          >
            Add your first trade
          </a>
        </p>
      )}

      {analysisTradeId != null && (
        <AnalysisModal
          title={`Trade #${analysisTradeId} Analysis`}
          content={analysisContent}
          loading={analysisLoading}
          onClose={() => {
            setAnalysisTradeId(null);
            setAnalysisContent("");
          }}
        />
      )}
    </Layout>
  );
}
