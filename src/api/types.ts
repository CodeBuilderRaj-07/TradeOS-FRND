export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface Strategy {
  id: number;
  name: string;
  description: string | null;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Trade {
  id: number;
  user_id: number;
  symbol: string;
  direction: "long" | "short";
  entry_date: string;
  exit_date: string | null;
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  pnl: number | null;
  pnl_percent: number | null;
  fees: number;
  strategy: Strategy | null;
  tags: Tag[];
  notes: string | null;
  screenshot_url: string | null;
  emotion_before: string | null;
  emotion_after: string | null;
  lesson: string | null;
  created_at: string;
  updated_at: string;
}

export interface TradeCreate {
  symbol: string;
  direction: "long" | "short";
  entry_date: string;
  exit_date?: string | null;
  entry_price: number;
  exit_price?: number | null;
  quantity: number;
  pnl?: number | null;
  pnl_percent?: number | null;
  fees?: number;
  strategy_id?: number | null;
  notes?: string | null;
  screenshot_url?: string | null;
  emotion_before?: string | null;
  emotion_after?: string | null;
  lesson?: string | null;
  tag_ids?: number[] | null;
}

export interface TradeStats {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_pnl: number;
  avg_pnl: number;
  avg_win: number;
  avg_loss: number;
  profit_factor: number;
  largest_win: number;
  largest_loss: number;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}
