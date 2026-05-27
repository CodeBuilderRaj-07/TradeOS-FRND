import { useState } from "react";
import { useTradeStats, useTrades, useStrategies, useTags } from "../api/hooks";
import { analyzePortfolio } from "../api";
import { Layout } from "../components/Layout";
import { AnalysisModal } from "../components/AnalysisModal";
import { MarketWidget } from "../components/MarketWidget";
import { NewsFeed } from "../components/NewsFeed";
import { FundamentalsWidget } from "../components/FundamentalsWidget";
import { EarningsWidget } from "../components/EarningsWidget";

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        borderRadius: 12,
        border: "1px solid var(--border)",
        padding: "20px 24px",
        flex: 1,
        minWidth: 160,
      }}
    >
      <p style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 4 }}>
        {label}
      </p>
      <p
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: color || "var(--text-primary)",
        }}
      >
        {value}
      </p>
    </div>
  );
}

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useTradeStats();
  const { data: trades } = useTrades({ limit: "10" });
  const [analysisContent, setAnalysisContent] = useState("");
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const { data: strategies } = useStrategies();
  const { data: tags } = useTags();

  const fmt = (n: number | undefined | null) => {
    if (n == null) return "-";
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <Layout>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Dashboard</h2>

      {statsLoading ? (
        <p style={{ color: "var(--text-secondary)" }}>Loading stats...</p>
      ) : stats ? (
        <>
          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 32,
            }}
          >
            <StatCard label="Total Trades" value={stats.total_trades} />
            <StatCard
              label="Win Rate"
              value={`${stats.win_rate.toFixed(1)}%`}
              color={stats.win_rate >= 50 ? "var(--green)" : "var(--red)"}
            />
            <StatCard
              label="Total P&L"
              value={`$${fmt(stats.total_pnl)}`}
              color={stats.total_pnl >= 0 ? "var(--green)" : "var(--red)"}
            />
            <StatCard label="Profit Factor" value={stats.profit_factor === Infinity ? "∞" : fmt(stats.profit_factor)} />
            <StatCard
              label="Avg Win"
              value={`$${fmt(stats.avg_win)}`}
              color="var(--green)"
            />
            <StatCard
              label="Avg Loss"
              value={`$${fmt(stats.avg_loss)}`}
              color="var(--red)"
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: 16,
              marginBottom: 24,
              alignItems: "center",
            }}
          >
            <button
              onClick={async () => {
                setAnalysisLoading(true);
                setShowAnalysis(true);
                try {
                  const res = await analyzePortfolio();
                  setAnalysisContent(res.analysis);
                } catch (err) {
                  setAnalysisContent(
                    err instanceof Error ? err.message : "Analysis failed"
                  );
                } finally {
                  setAnalysisLoading(false);
                }
              }}
              disabled={analysisLoading || !stats?.total_trades}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                opacity:
                  analysisLoading || !stats?.total_trades ? 0.6 : 1,
              }}
            >
              {analysisLoading ? "Analyzing..." : "AI Portfolio Analysis"}
            </button>
          </div>

          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div
              style={{
                flex: 2,
                minWidth: 300,
                background: "var(--bg-card)",
                borderRadius: 12,
                border: "1px solid var(--border)",
                padding: 20,
              }}
            >
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 16,
                }}
              >
                Recent Trades
              </h3>
              {trades && trades.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {trades.map((t) => (
                    <a
                      key={t.id}
                      href={`/trades/${t.id}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 16px",
                        background: "var(--bg-secondary)",
                        borderRadius: 8,
                        textDecoration: "none",
                        fontSize: 14,
                      }}
                    >
                      <div>
                        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                          {t.symbol}
                        </span>
                        <span
                          style={{
                            marginLeft: 8,
                            color:
                              t.direction === "long"
                                ? "var(--green)"
                                : "var(--red)",
                            fontSize: 12,
                          }}
                        >
                          {t.direction.toUpperCase()}
                        </span>
                      </div>
                      <span
                        style={{
                          fontWeight: 600,
                          color:
                            t.pnl && t.pnl >= 0
                              ? "var(--green)"
                              : "var(--red)",
                        }}
                      >
                        {t.pnl != null ? `${t.pnl >= 0 ? "+" : ""}$${fmt(t.pnl)}` : "-"}
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                  No trades yet.{" "}
                  <a
                    href="/trades/new"
                    style={{ color: "var(--accent)", textDecoration: "none" }}
                  >
                    Add your first trade
                  </a>
                </p>
              )}
            </div>

            <div
              style={{
                flex: 1,
                minWidth: 200,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div
                style={{
                  background: "var(--bg-card)",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  padding: 20,
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                  Strategies
                </h3>
                {strategies && strategies.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {strategies.map((s) => (
                      <span
                        key={s.id}
                        style={{
                          padding: "6px 12px",
                          background: "var(--bg-secondary)",
                          borderRadius: 6,
                          fontSize: 13,
                          color: "var(--text-secondary)",
                        }}
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                    No strategies yet
                  </p>
                )}
              </div>

              <div
                style={{
                  background: "var(--bg-card)",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  padding: 20,
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                  Tags
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {tags && tags.length > 0 ? (
                    tags.map((t) => (
                      <span
                        key={t.id}
                        style={{
                          padding: "4px 10px",
                          background: "var(--accent)",
                          borderRadius: 4,
                          fontSize: 12,
                          color: "#fff",
                        }}
                      >
                        {t.name}
                      </span>
                    ))
                  ) : (
                    <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                      No tags yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              marginTop: 24,
            }}
          >
            <MarketWidget />
            <NewsFeed />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              marginTop: 24,
            }}
          >
            <FundamentalsWidget />
            <EarningsWidget />
          </div>
        </>
      ) : (
        <div>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
            Start by adding your first trade, then check back for stats,
            market data, and news.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
            }}
          >
            <MarketWidget />
            <NewsFeed />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              marginTop: 24,
            }}
          >
            <FundamentalsWidget />
            <EarningsWidget />
          </div>
        </div>
      )}
      {showAnalysis && (
        <AnalysisModal
          title="Portfolio Analysis"
          content={analysisContent}
          loading={analysisLoading}
          onClose={() => setShowAnalysis(false)}
        />
      )}
    </Layout>
  );
}
