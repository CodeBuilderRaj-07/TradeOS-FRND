interface AnalysisModalProps {
  title: string;
  content: string;
  loading: boolean;
  onClose: () => void;
}

export function AnalysisModal({ title, content, loading, onClose }: AnalysisModalProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 640,
          width: "100%",
          maxHeight: "80vh",
          overflow: "auto",
          background: "var(--bg-card)",
          borderRadius: 16,
          border: "1px solid var(--border)",
          padding: 32,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 600 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: 20,
            }}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p style={{ color: "var(--text-secondary)" }}>Analyzing trade...</p>
        ) : (
          <div
            style={{
              color: "var(--text-primary)",
              fontSize: 14,
              lineHeight: 1.7,
            }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        )}
      </div>
    </div>
  );
}

function renderMarkdown(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((block) => {
      if (block.startsWith("**") || block.startsWith("#")) {
        return `<p style="margin-bottom:12px;font-weight:600;color:var(--accent)">${block
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/^#+\s*/, "")}</p>`;
      }
      if (block.startsWith("- ") || block.startsWith("* ")) {
        const items = block
          .split(/\n/)
          .filter((l) => l.startsWith("- ") || l.startsWith("* "))
          .map((l) => `<li>${l.replace(/^[-*]\s+/, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</li>`)
          .join("");
        return `<ul style="margin:8px 0;padding-left:20px;list-style:disc">${items}</ul>`;
      }
      return `<p style="margin-bottom:8px">${block.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</p>`;
    })
    .join("");
}
