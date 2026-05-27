import { useTradeStats, useTrades } from "../api/hooks";
import { Layout } from "../components/Layout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#22c55e", "#ef4444"];

export function Analytics() {
  const { data: stats } = useTradeStats();
  const { data: trades } = useTrades({ limit: "500" });

  const fmt = (n: number | undefined | null) => {
    if (n == null) return "-";
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const winLossData = [
    { name: "Wins", value: stats?.winning_trades || 0 },
    { name: "Losses", value: stats?.losing_trades || 0 },
  ];

  const tradesBySymbol =
    trades?.reduce(
      (acc, t) => {
        acc[t.symbol] = (acc[t.symbol] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ) ?? {};

  const symbolChartData = Object.entries(tradesBySymbol)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([symbol, count]) => ({ symbol, count }));

  const pnlByDate =
    trades
      ?.filter((t) => t.pnl != null)
      .sort(
        (a, b) =>
          new Date(a.exit_date || a.entry_date).getTime() -
          new Date(b.exit_date || b.entry_date).getTime()
      )
      .map((t) => ({
        date: new Date(t.exit_date || t.entry_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        pnl: t.pnl || 0,
      })) ?? [];

  const cumPnl = pnlByDate.reduce(
    (acc, curr) => {
      const prev = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
      acc.push({ date: curr.date, cumulative: prev + curr.pnl, pnl: curr.pnl });
      return acc;
    },
    [] as { date: string; cumulative: number; pnl: number }[]
  );

  return (
    <Layout>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>
        Analytics
      </h2>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 32 }}>
        <div
          style={{
            flex: 1,
            minWidth: 300,
            background: "var(--bg-card)",
            borderRadius: 12,
            border: "1px solid var(--border)",
            padding: 20,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            Win / Loss Ratio
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={winLossData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {winLossData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 300,
            background: "var(--bg-card)",
            borderRadius: 12,
            border: "1px solid var(--border)",
            padding: 20,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            Cumulative P&L
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={cumPnl}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "#1a1d28",
                  border: "1px solid #2d3148",
                  borderRadius: 8,
                  color: "#f1f5f9",
                }}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div
          style={{
            flex: 1,
            minWidth: 300,
            background: "var(--bg-card)",
            borderRadius: 12,
            border: "1px solid var(--border)",
            padding: 20,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            P&L per Trade
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={pnlByDate.slice(-30)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "#1a1d28",
                  border: "1px solid #2d3148",
                  borderRadius: 8,
                  color: "#f1f5f9",
                }}
              />
              <Bar dataKey="pnl" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                {pnlByDate.slice(-30).map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={entry.pnl >= 0 ? "#22c55e" : "#ef4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 300,
            background: "var(--bg-card)",
            borderRadius: 12,
            border: "1px solid var(--border)",
            padding: 20,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            Most Traded Symbols
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={symbolChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
              <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="symbol"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a1d28",
                  border: "1px solid #2d3148",
                  borderRadius: 8,
                  color: "#f1f5f9",
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {stats && (
        <div
          style={{
            marginTop: 24,
            background: "var(--bg-card)",
            borderRadius: 12,
            border: "1px solid var(--border)",
            padding: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 16,
          }}
        >
          <StatItem label="Avg Win" value={`$${fmt(stats.avg_win)}`} />
          <StatItem label="Avg Loss" value={`$${fmt(stats.avg_loss)}`} />
          <StatItem label="Largest Win" value={`$${fmt(stats.largest_win)}`} />
          <StatItem label="Largest Loss" value={`$${fmt(stats.largest_loss)}`} />
          <StatItem label="Avg P&L" value={`$${fmt(stats.avg_pnl)}`} />
          <StatItem label="Profit Factor" value={stats.profit_factor === Infinity ? "∞" : fmt(stats.profit_factor)} />
        </div>
      )}
    </Layout>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 2 }}>
        {label}
      </p>
      <p style={{ fontSize: 18, fontWeight: 600 }}>{value}</p>
    </div>
  );
}
