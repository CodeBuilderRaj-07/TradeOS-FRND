import { useState } from "react";

interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: string;
  high: number;
  low: number;
  volume: number;
  previous_close: number;
  timestamp: string;
}

export function MarketWidget() {
  const [symbol, setSymbol] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchQuote = async () => {
    if (!symbol.trim()) return;
    setLoading(true);
    setError("");
    setQuote(null);
    try {
      const token = localStorage.getItem("tradeos_token");
      const res = await fetch(`/api/market/quote?symbol=${encodeURIComponent(symbol.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Failed" }));
        throw new Error(err.detail || "Quote fetch failed");
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuote(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

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
        Market Data
      </h3>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          placeholder="Symbol (e.g. AAPL, BTC/USD)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && fetchQuote()}
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
          onClick={fetchQuote}
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
          {loading ? "..." : "Get Quote"}
        </button>
      </div>

      {error && (
        <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 8 }}>
          {error}
        </p>
      )}

      {quote && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 16,
            }}
          >
            <div>
              <p style={{ fontSize: 18, fontWeight: 700 }}>{quote.symbol}</p>
              {quote.name && (
                <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                  {quote.name}
                </p>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 24, fontWeight: 700 }}>
                ${quote.price.toFixed(2)}
              </p>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color:
                    quote.change >= 0 ? "var(--green)" : "var(--red)",
                }}
              >
                {quote.change >= 0 ? "+" : ""}
                {quote.change.toFixed(2)} ({quote.change_percent})
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px 16px",
              fontSize: 13,
            }}
          >
            {[
              { label: "High", value: `$${quote.high.toFixed(2)}` },
              { label: "Low", value: `$${quote.low.toFixed(2)}` },
              {
                label: "Prev Close",
                value: `$${quote.previous_close.toFixed(2)}`,
              },
              {
                label: "Volume",
                value: quote.volume.toLocaleString(),
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span style={{ color: "var(--text-secondary)" }}>
                  {label}
                </span>
                <span style={{ fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
