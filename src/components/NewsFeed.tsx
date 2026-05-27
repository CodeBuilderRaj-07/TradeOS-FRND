import { useState, useEffect } from "react";

interface Article {
  title: string;
  description: string;
  url: string;
  source: string;
  published_at: string;
  image_url: string | null;
}

export function NewsFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [symbol, setSymbol] = useState("");

  const fetchNews = async (query?: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("tradeos_token");
      const endpoint = query
        ? `/api/news/search?query=${encodeURIComponent(query)}&limit=8`
        : "/api/news/top?limit=8";
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setArticles(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNews(symbol || undefined);
  };

  const timeAgo = (dateStr: string) => {
    const mins = Math.floor(
      (Date.now() - new Date(dateStr).getTime()) / 60000
    );
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>Market News</h3>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 6 }}>
          <input
            placeholder="Filter by symbol..."
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              fontSize: 12,
              outline: "none",
              width: 140,
            }}
          />
          <button
            type="submit"
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: "none",
              background: "var(--accent)",
              color: "#fff",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
          Loading news...
        </p>
      ) : articles.length === 0 ? (
        <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
          No news found
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {articles.map((a, i) => (
            <a
              key={i}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                gap: 12,
                padding: "10px 12px",
                background: "var(--bg-secondary)",
                borderRadius: 8,
                textDecoration: "none",
                transition: "opacity 0.15s",
              }}
            >
              {a.image_url && (
                <img
                  src={a.image_url}
                  alt=""
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 6,
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = "none";
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: 4,
                    lineHeight: 1.4,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {a.title}
                </p>
                {a.description && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      marginBottom: 4,
                      lineHeight: 1.4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {a.description}
                  </p>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    fontSize: 11,
                    color: "var(--text-secondary)",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{a.source}</span>
                  <span>{timeAgo(a.published_at)}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
