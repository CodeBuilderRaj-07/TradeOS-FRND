import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateTrade, useUpdateTrade, useStrategies, useTags, useTrades } from "../api/hooks";
import { Layout } from "../components/Layout";

export function TradeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const createTrade = useCreateTrade();
  const updateTrade = useUpdateTrade();
  const { data: strategies } = useStrategies();
  const { data: tags } = useTags();
  const { data: trades } = useTrades();

  const [form, setForm] = useState({
    symbol: "",
    direction: "long" as "long" | "short",
    entry_date: "",
    exit_date: "",
    entry_price: "",
    exit_price: "",
    quantity: "1",
    pnl: "",
    pnl_percent: "",
    fees: "0",
    strategy_id: "",
    notes: "",
    emotion_before: "",
    emotion_after: "",
    lesson: "",
    tag_ids: [] as number[],
  });

  useEffect(() => {
    if (isEdit && trades && id) {
      const trade = trades.find((t) => t.id === Number(id));
      if (trade) {
        setForm({
          symbol: trade.symbol,
          direction: trade.direction,
          entry_date: trade.entry_date.slice(0, 16),
          exit_date: trade.exit_date?.slice(0, 16) ?? "",
          entry_price: String(trade.entry_price),
          exit_price: trade.exit_price != null ? String(trade.exit_price) : "",
          quantity: String(trade.quantity),
          pnl: trade.pnl != null ? String(trade.pnl) : "",
          pnl_percent: trade.pnl_percent != null ? String(trade.pnl_percent) : "",
          fees: String(trade.fees),
          strategy_id: trade.strategy?.id ? String(trade.strategy.id) : "",
          notes: trade.notes ?? "",
          emotion_before: trade.emotion_before ?? "",
          emotion_after: trade.emotion_after ?? "",
          lesson: trade.lesson ?? "",
          tag_ids: trade.tags.map((t) => t.id),
        });
      }
    }
  }, [isEdit, id, trades]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      symbol: form.symbol.toUpperCase(),
      direction: form.direction,
      entry_date: new Date(form.entry_date).toISOString(),
      exit_date: form.exit_date ? new Date(form.exit_date).toISOString() : null,
      entry_price: Number(form.entry_price),
      exit_price: form.exit_price ? Number(form.exit_price) : null,
      quantity: Number(form.quantity),
      pnl: form.pnl ? Number(form.pnl) : null,
      pnl_percent: form.pnl_percent ? Number(form.pnl_percent) : null,
      fees: Number(form.fees),
      strategy_id: form.strategy_id ? Number(form.strategy_id) : null,
      notes: form.notes || null,
      emotion_before: form.emotion_before || null,
      emotion_after: form.emotion_after || null,
      lesson: form.lesson || null,
      tag_ids: form.tag_ids.length > 0 ? form.tag_ids : null,
    };

    try {
      if (isEdit && id) {
        await updateTrade.mutateAsync({ id: Number(id), data: payload });
      } else {
        await createTrade.mutateAsync(payload as any);
      }
      navigate("/trades");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save trade");
    }
  };

  const toggleTag = (tagId: number) => {
    setForm((f) => ({
      ...f,
      tag_ids: f.tag_ids.includes(tagId)
        ? f.tag_ids.filter((id) => id !== tagId)
        : [...f.tag_ids, tagId],
    }));
  };

  return (
    <Layout>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>
        {isEdit ? "Edit Trade" : "New Trade"}
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          maxWidth: 600,
        }}
      >
        <div
          style={{
            background: "var(--bg-card)",
            borderRadius: 12,
            border: "1px solid var(--border)",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
            Trade Details
          </h3>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Symbol</label>
              <input
                placeholder="e.g. AAPL"
                value={form.symbol}
                onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Direction</label>
              <select
                value={form.direction}
                onChange={(e) =>
                  setForm({ ...form, direction: e.target.value as "long" | "short" })
                }
                style={inputStyle}
              >
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Entry Date</label>
              <input
                type="datetime-local"
                value={form.entry_date}
                onChange={(e) => setForm({ ...form, entry_date: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Exit Date</label>
              <input
                type="datetime-local"
                value={form.exit_date}
                onChange={(e) => setForm({ ...form, exit_date: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Entry Price</label>
              <input
                type="number"
                step="0.0001"
                placeholder="0.00"
                value={form.entry_price}
                onChange={(e) => setForm({ ...form, entry_price: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Exit Price</label>
              <input
                type="number"
                step="0.0001"
                placeholder="0.00"
                value={form.exit_price}
                onChange={(e) => setForm({ ...form, exit_price: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Quantity</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Fees</label>
              <input
                type="number"
                step="0.01"
                value={form.fees}
                onChange={(e) => setForm({ ...form, fees: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>P&L ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.pnl}
                onChange={(e) => setForm({ ...form, pnl: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>P&L (%)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.pnl_percent}
                onChange={(e) => setForm({ ...form, pnl_percent: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            background: "var(--bg-card)",
            borderRadius: 12,
            border: "1px solid var(--border)",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
            Strategy & Tags
          </h3>

          <div>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Strategy</label>
            <select
              value={form.strategy_id}
              onChange={(e) => setForm({ ...form, strategy_id: e.target.value })}
              style={inputStyle}
            >
              <option value="">None</option>
              {strategies?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Tags</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {tags?.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                    cursor: "pointer",
                    fontSize: 13,
                    background: form.tag_ids.includes(tag.id)
                      ? "var(--accent)"
                      : "var(--bg-secondary)",
                    color: form.tag_ids.includes(tag.id) ? "#fff" : "var(--text-secondary)",
                  }}
                >
                  {tag.name}
                </button>
              ))}
              {(!tags || tags.length === 0) && (
                <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                  No tags created yet
                </span>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            background: "var(--bg-card)",
            borderRadius: 12,
            border: "1px solid var(--border)",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
            Journal
          </h3>

          <div>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Emotion Before</label>
            <select
              value={form.emotion_before}
              onChange={(e) => setForm({ ...form, emotion_before: e.target.value })}
              style={inputStyle}
            >
              <option value="">Select...</option>
              {["Confident", "Hesitant", "Excited", "Nervous", "Calm", "Greedy", "Fearful", "Impatient"].map(
                (e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Emotion After</label>
            <select
              value={form.emotion_after}
              onChange={(e) => setForm({ ...form, emotion_after: e.target.value })}
              style={inputStyle}
            >
              <option value="">Select...</option>
              {["Satisfied", "Regretful", "Neutral", "Elated", "Frustrated", "Relieved", "Disappointed", "Proud"].map(
                (e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Notes</label>
            <textarea
              placeholder="Trade rationale, market context..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Lesson Learned</label>
            <textarea
              placeholder="What did you learn from this trade?"
              value={form.lesson}
              onChange={(e) => setForm({ ...form, lesson: e.target.value })}
              rows={2}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={createTrade.isPending || updateTrade.isPending}
          style={{
            padding: "14px 24px",
            borderRadius: 8,
            border: "none",
            background: "var(--accent)",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            opacity: createTrade.isPending || updateTrade.isPending ? 0.7 : 1,
            alignSelf: "flex-start",
          }}
        >
          {createTrade.isPending || updateTrade.isPending
            ? "Saving..."
            : isEdit
              ? "Update Trade"
              : "Add Trade"}
        </button>
      </form>
    </Layout>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--bg-secondary)",
  color: "var(--text-primary)",
  fontSize: 14,
  outline: "none",
};
