import { useState, useEffect } from "react";

interface EarningsEvent {
  symbol: string;
  name: string;
  date: string;
  hour: string;
  estimate: number;
  actual: number;
  year: number;
  quarter: number;
}

export function EarningsWidget() {
  const [earnings, setEarnings] = useState<EarningsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [symbol, setSymbol] = useState("");

  const fetchEarnings = async (query?: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("tradeos_token");
      const params = new URLSearchParams();
      if (query) params.set("symbol", query);
      const res = await fetch(`/api/fundamentals/earnings?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setEarnings(
          data.sort(
            (a, b) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          )
        );
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const today = new Date();
  const upcoming = earnings.filter(
    (e) => new Date(e.date) >= today
  );
  const displayed = symbol
    ? upcoming.filter(
        (e) => e.symbol.toLowerCase() === symbol.toLowerCase()
      )
    : upcoming.slice(0, 10);

  return (
    <div
      style={{
        background: "var(--bg-card)",
        borderRadius: 12,
        border: "1px solid var(--border)",
        padding: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>Earnings Calendar</h3>
        <input
          placeholder="Filter symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid var(--border)",
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            fontSize: 12,
            outline: "none",
            width: 100,
          }}
        />
      </div>

      {loading ? (
        <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
          Loading earnings...
        </p>
      ) : displayed.length === 0 ? (
        <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
          No upcoming earnings
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {displayed.map((e, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 12px",
                background: "var(--bg-secondary)",
                borderRadius: 6,
                fontSize: 13,
              }}
            >
              <div>
                <span style={{ fontWeight: 600 }}>{e.symbol}</span>
                {e.name && (
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: 11,
                      marginLeft: 6,
                    }}
                  >
                    {e.name.length > 20
                      ? e.name.slice(0, 20) + "…"
                      : e.name}
                  </span>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                  {new Date(e.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  {e.hour && `(${e.hour})`}
                </p>
                <p style={{ fontSize: 11, fontWeight: 500 }}>
                  Est: ${e.estimate?.toFixed(2) ?? "-"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
