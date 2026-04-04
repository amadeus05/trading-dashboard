// Dashboard types matching paper_web.py API

export interface DashboardMetrics {
  exchange: string;
  timeframe: string;
  htf_timeframe: string;
  leverage: number;
  initial_balance: number;
  wallet_balance: number;
  realized_pnl: number;
  open_margin: number;
  available_balance: number;
  open_positions_count: number;
  closed_trades_count: number;
  win_rate: number;
  profit_factor: number;
  avg_win: number;
  avg_loss: number;
  max_drawdown_pct: number;
  best_trade: number;
  worst_trade: number;
  total_trades: number;
  longs_count: number;
  shorts_count: number;
  // Filtered metrics
  filtered_realized_pnl?: number;
  filtered_win_rate?: number;
  filtered_trades_count?: number;
}

export interface OpenPosition {
  id: string | number;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entry_price: number;
  entry_notional: number;
  stop_pct: number;
  take_pct: number;
  p_long: number | null;
  p_short: number | null;
  entry_time: string;
}

export interface Trade {
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entry_price: number;
  exit_price: number;
  notional: number;
  pnl: number;
  pnl_pct: number;
  exit_reason: string;
  exit_time: string;
  is_win: boolean;
}

export interface EquityPoint {
  time: string;
  balance: number;
}

export interface Filters {
  date_from: string;
  date_to: string;
  symbols: string[];
  direction: string;
  exit_reasons: string[];
  has_active_filters: boolean;
  all_symbols: string[];
  all_exit_reasons: string[];
}

export interface DashboardPayload {
  metrics: DashboardMetrics;
  open_positions: OpenPosition[];
  recent_trades: Trade[];
  equity_curve: EquityPoint[];
  filters: Filters;
  demo_mode: boolean;
  demo_message: string;
  current_time: string;
}

export interface FilterState {
  dateFrom: string;
  dateTo: string;
  selectedSymbols: string[];
  direction: string;
  selectedExitReasons: string[];
}
