import { useState } from "react";

interface Profile {
  symbol: string;
  name: string;
  exchange: string;
  industry: string;
  market_cap: number;
  shares: number;
  ipo: string;
  logo: string;
  weburl: string;
}

interface Metrics {
  pe_ratio: number;
  forward_pe: number;
  eps: number;
  dividend_yield: number;
  beta: number;
  high_52w: number;
  low_52w: number;
  avg_volume: number;
  market_cap: number;
  revenue: number;
  profit_margin: number;
}

interface Recommendation {
  period: string;
  buy: number;
  hold: number;
  sell: number;
  strong_buy: number;
  strong_sell: number;
}

export function FundamentalsWidget() {
  const [symbol, setSymbol] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchFundamentals = async () => {
    if (!symbol.trim()) return;
    setLoading(true);
    setError("");
    setProfile(null);
    setMetrics(null);
    setRecs([]);

    const token = localStorage.getItem("tradeos_token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [profileRes, metricsRes, recsRes] = await Promise.all([
        fetch(`/api/fundamentals/profile?symbol=${encodeURIComponent(symbol.trim())}`, { headers }),
        fetch(`/api/fundamentals/metrics?symbol=${encodeURIComponent(symbol.trim())}`, { headers }),
        fetch(`/api/fundamentals/recommendations?symbol=${encodeURIComponent(symbol.trim())}`, { headers }),
      ]);

      const profileData = await profileRes.json();
      if (!profileData.error) setProfile(profileData);

      const metricsData = await metricsRes.json();
      if (!metricsData.error) setMetrics(metricsData);

      const recsData = await recsRes.json();
      if (Array.isArray(recsData)) setRecs(recsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load fundamentals");
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number | undefined | null) => {
    if (n == null) return "-";
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const totalRecs = (r: Recommendation) =>
    r.strong_buy + r.buy + r.hold + r.sell + r.strong_sell;

  return (
    <div
      style={{
        background: "var(--bg-card)",
        borderRadius: 12,
        border: "1px solid var(--border)",
        padding: 20,
      }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
        Fundamentals
      </h3>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          placeholder="Symbol (e.g. AAPL)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && fetchFundamentals()}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            fontSize: 14,
            outline: "none",
          }}
        />
        <button
          onClick={fetchFundamentals}
          disabled={loading || !symbol.trim()}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: "var(--accent)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            opacity: loading || !symbol.trim() ? 0.6 : 1,
          }}
        >
          {loading ? "..." : "Search"}
        </button>
      </div>

      {error && (
        <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 8 }}>
          {error}
        </p>
      )}

      {profile && (
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            {profile.logo && (
              <img
                src={profile.logo}
                alt=""
                style={{ width: 40, height: 40, borderRadius: 8 }}
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
            )}
            <div>
              <p style={{ fontSize: 16, fontWeight: 700 }}>
                {profile.name}
              </p>
              <p style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                {profile.symbol} · {profile.exchange} · {profile.industry}
              </p>
            </div>
          </div>
        </div>
      )}

      {metrics && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6px 16px",
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          {[
            { label: "P/E Ratio", value: metrics.pe_ratio?.toFixed(2) || "-" },
            {
              label: "Forward P/E",
              value: metrics.forward_pe?.toFixed(2) || "-",
            },
            { label: "EPS", value: metrics.eps?.toFixed(2) || "-" },
            {
              label: "Div Yield",
              value: metrics.dividend_yield
                ? `${(metrics.dividend_yield * 100).toFixed(2)}%`
                : "-",
            },
            { label: "Beta", value: metrics.beta?.toFixed(2) || "-" },
            {
              label: "52W High",
              value: metrics.high_52w
                ? `$${metrics.high_52w.toFixed(2)}`
                : "-",
            },
            {
              label: "52W Low",
              value: metrics.low_52w
                ? `$${metrics.low_52w.toFixed(2)}`
                : "-",
            },
            { label: "Mkt Cap", value: fmt(metrics.market_cap) },
            { label: "Revenue", value: fmt(metrics.revenue) },
            {
              label: "Profit Margin",
              value: metrics.profit_margin
                ? `${(metrics.profit_margin * 100).toFixed(1)}%`
                : "-",
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "5px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span style={{ color: "var(--text-secondary)" }}>{label}</span>
              <span style={{ fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>
      )}

      {recs.length > 0 && (
        <div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 8,
              color: "var(--text-secondary)",
            }}
          >
            Analyst Recommendations
          </p>
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            {recs.slice(0, 3).map((r) => {
              const total = totalRecs(r);
              const buyPct =
                total > 0
                  ? (((r.strong_buy + r.buy) / total) * 100).toFixed(0)
                  : 0;
              return (
                <div
                  key={r.period}
                  style={{
                    padding: "8px 12px",
                    background: "var(--bg-secondary)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                >
                  <p style={{ color: "var(--text-secondary)", marginBottom: 2 }}>
                    {r.period}
                  </p>
                  <p style={{ fontWeight: 600, color: "var(--green)" }}>
                    {buyPct}% Buy
                  </p>
                  <p style={{ color: "var(--text-secondary)", fontSize: 11 }}>
                    ({r.strong_buy + r.buy}/{total} analysts)
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
