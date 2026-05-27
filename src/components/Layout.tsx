import { type ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { label: "Dashboard", href: "/", icon: "📊" },
  { label: "Trades", href: "/trades", icon: "📝" },
  { label: "New Trade", href: "/trades/new", icon: "➕" },
  { label: "Analytics", href: "/analytics", icon: "📈" },
];

export function Layout({ children }: LayoutProps) {
  const handleLogout = () => {
    localStorage.removeItem("tradeos_token");
    window.location.href = "/login";
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav
        style={{
          width: 220,
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border)",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--accent)",
            marginBottom: 24,
            letterSpacing: "-0.5px",
          }}
        >
          TradeOS
        </div>
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 8,
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontSize: 14,
              transition: "all 0.15s",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "var(--bg-card)";
              (e.currentTarget as HTMLElement).style.color =
                "var(--text-primary)";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color =
                "var(--text-secondary)";
            }}
          >
            <span>{item.icon}</span>
            {item.label}
          </a>
        ))}
        <div style={{ marginTop: "auto" }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: 14,
              textAlign: "left",
            }}
          >
            Logout
          </button>
        </div>
      </nav>
      <main style={{ flex: 1, padding: 32, overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
