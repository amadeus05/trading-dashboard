import axios from 'axios';
import type {
  AppIdentity,
  DashboardPayload,
  OpenPosition,
  Trade,
  EquityPoint,
  DashboardMetrics,
  HealthPayload,
  HealthState,
} from '../types';
import { isDemoMode, generateDemoDashboardPayload } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const APP_TITLE = import.meta.env.VITE_APP_TITLE || 'Trading Bot Dashboard';
const BOT_NAME = import.meta.env.VITE_BOT_NAME || 'Trading Bot';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  const numberValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function asDirection(value: unknown): 'LONG' | 'SHORT' {
  const direction = asString(value).toUpperCase();
  return direction === 'SHORT' ? 'SHORT' : 'LONG';
}

function normalizeAppIdentity(value: unknown, metrics: DashboardMetrics): AppIdentity {
  const source = isRecord(value) ? value : {};
  return {
    app_title: asString(source.app_title, APP_TITLE),
    bot_name: asString(source.bot_name, BOT_NAME),
    mode: asString(source.mode, isDemoMode() ? 'demo' : import.meta.env.MODE),
    exchange: asString(source.exchange, metrics.exchange),
    account: asString(source.account, ''),
    strategy: asString(source.strategy, ''),
    environment: asString(source.environment, import.meta.env.MODE),
  };
}

function normalizeMetrics(value: unknown): DashboardMetrics {
  const source = isRecord(value) ? value : {};
  const walletBalance = asNumber(source.wallet_balance, 0);
  const realizedPnl = asNumber(source.realized_pnl, 0);
  const unrealizedPnl = asNumber(source.unrealized_pnl, 0);
  const totalTrades = asNumber(source.total_trades, 0);
  const closedTrades = asNumber(source.closed_trades_count, 0);
  return {
    exchange: asString(source.exchange, 'BYBIT'),
    timeframe: asString(source.timeframe, '1h'),
    htf_timeframe: asString(source.htf_timeframe, '4h'),
    leverage: asNumber(source.leverage, 1),
    initial_balance: asNumber(source.initial_balance, 0),
    equity: asNumber(source.equity, walletBalance + unrealizedPnl),
    wallet_balance: walletBalance,
    realized_pnl: realizedPnl,
    unrealized_pnl: unrealizedPnl,
    pnl_today: asNumber(source.pnl_today, 0),
    pnl_7d: asNumber(source.pnl_7d, 0),
    open_margin: asNumber(source.open_margin, 0),
    available_balance: asNumber(source.available_balance, 0),
    exposure_total: asNumber(source.exposure_total, 0),
    exposure_long: asNumber(source.exposure_long, 0),
    exposure_short: asNumber(source.exposure_short, 0),
    risk_at_stop: asNumber(source.risk_at_stop, 0),
    open_positions_count: asNumber(source.open_positions_count, 0),
    closed_trades_count: closedTrades,
    win_rate: asNumber(source.win_rate, 0),
    profit_factor: asNumber(source.profit_factor, 0),
    expectancy: asNumber(source.expectancy, 0),
    payoff_ratio: asNumber(source.payoff_ratio, 0),
    avg_win: asNumber(source.avg_win, 0),
    avg_loss: asNumber(source.avg_loss, 0),
    max_drawdown_pct: asNumber(source.max_drawdown_pct, 0),
    recovery_factor: asNumber(source.recovery_factor, 0),
    best_trade: asNumber(source.best_trade, 0),
    worst_trade: asNumber(source.worst_trade, 0),
    total_trades: totalTrades,
    trades_today: asNumber(source.trades_today, 0),
    longs_count: asNumber(source.longs_count, 0),
    shorts_count: asNumber(source.shorts_count, 0),
    last_market_event_time: asString(source.last_market_event_time, ''),
    last_signal_time: asString(source.last_signal_time, ''),
    system_status: normalizeSystemStatus(source.system_status),
    filtered_realized_pnl: asNumber(source.filtered_realized_pnl, realizedPnl),
    filtered_win_rate: asNumber(source.filtered_win_rate, asNumber(source.win_rate, 0)),
    filtered_trades_count: asNumber(source.filtered_trades_count, closedTrades),
  };
}

function normalizeSystemStatus(value: unknown): DashboardMetrics['system_status'] {
  const status = asString(value, 'running').toLowerCase();
  if (status === 'paused' || status === 'error' || status === 'idle') return status;
  return 'running';
}

function normalizePosition(value: unknown): OpenPosition {
  const source = isRecord(value) ? value : {};
  return {
    id: asString(source.id, String(source.symbol || 'position')),
    symbol: asString(source.symbol, '-'),
    direction: asDirection(source.direction),
    entry_price: asNumber(source.entry_price, 0),
    entry_notional: asNumber(source.entry_notional, 0),
    stop_pct: asNumber(source.stop_pct, 0),
    take_pct: asNumber(source.take_pct, 0),
    p_long: source.p_long === null ? null : asNumber(source.p_long, 0),
    p_short: source.p_short === null ? null : asNumber(source.p_short, 0),
    entry_time: asString(source.entry_time, '-'),
  };
}

function normalizeTrade(value: unknown): Trade {
  const source = isRecord(value) ? value : {};
  const pnl = asNumber(source.pnl, 0);
  return {
    symbol: asString(source.symbol, '-'),
    direction: asDirection(source.direction),
    entry_price: asNumber(source.entry_price, 0),
    exit_price: asNumber(source.exit_price, 0),
    notional: asNumber(source.notional, 0),
    pnl,
    pnl_pct: asNumber(source.pnl_pct, 0),
    exit_reason: asString(source.exit_reason, 'UNKNOWN'),
    exit_time: asString(source.exit_time, '-'),
    is_win: typeof source.is_win === 'boolean' ? source.is_win : pnl > 0,
    entry_time: asString(source.entry_time, ''),
    duration_minutes: asNumber(source.duration_minutes, 0),
    fee: asNumber(source.fee, 0),
    p_long: source.p_long === null ? null : asNumber(source.p_long, 0),
    p_short: source.p_short === null ? null : asNumber(source.p_short, 0),
    signal_gap: source.signal_gap === null ? null : asNumber(source.signal_gap, 0),
    risk_pct: source.risk_pct === null ? null : asNumber(source.risk_pct, 0),
  };
}

function normalizeEquityPoint(value: unknown): EquityPoint {
  const source = isRecord(value) ? value : {};
  return {
    time: asString(source.time, ''),
    balance: asNumber(source.balance, 0),
  };
}

function normalizeDashboardPayload(value: unknown): DashboardPayload {
  const source = isRecord(value) ? value : {};
  const baseMetrics = normalizeMetrics(source.metrics);
  const openPositions = Array.isArray(source.open_positions) ? source.open_positions.map(normalizePosition) : [];
  const recentTrades = Array.isArray(source.recent_trades) ? source.recent_trades.map(normalizeTrade) : [];
  const equityCurve = Array.isArray(source.equity_curve) ? source.equity_curve.map(normalizeEquityPoint) : [];
  const metrics = enrichMetrics(baseMetrics, openPositions, recentTrades, equityCurve);
  const filters = isRecord(source.filters) ? source.filters : {};

  return {
    app: normalizeAppIdentity(source.app, metrics),
    metrics,
    open_positions: openPositions,
    recent_trades: recentTrades,
    equity_curve: equityCurve,
    filters: {
      date_from: asString(filters.date_from, ''),
      date_to: asString(filters.date_to, ''),
      symbols: asStringArray(filters.symbols),
      direction: asString(filters.direction, ''),
      exit_reasons: asStringArray(filters.exit_reasons),
      has_active_filters: Boolean(filters.has_active_filters),
      all_symbols: asStringArray(filters.all_symbols),
      all_exit_reasons: asStringArray(filters.all_exit_reasons),
    },
    demo_mode: Boolean(source.demo_mode),
    demo_message: asString(source.demo_message, ''),
    current_time: asString(source.current_time, new Date().toISOString()),
  };
}

function enrichMetrics(
  metrics: DashboardMetrics,
  positions: OpenPosition[],
  trades: Trade[],
  equityCurve: EquityPoint[],
): DashboardMetrics {
  const wins = trades.filter((trade) => trade.pnl > 0);
  const losses = trades.filter((trade) => trade.pnl <= 0);
  const grossWins = wins.reduce((sum, trade) => sum + trade.pnl, 0);
  const grossLossesAbs = Math.abs(losses.reduce((sum, trade) => sum + trade.pnl, 0));
  const closedTrades = trades.length || metrics.closed_trades_count;
  const winRate = closedTrades > 0 ? (wins.length / closedTrades) * 100 : metrics.win_rate;
  const avgWin = wins.length > 0 ? grossWins / wins.length : metrics.avg_win;
  const avgLoss = losses.length > 0 ? grossLossesAbs / losses.length : metrics.avg_loss;
  const lossRate = closedTrades > 0 ? 1 - wins.length / closedTrades : 0;
  const expectancy = closedTrades > 0 ? (wins.length / closedTrades) * avgWin - lossRate * avgLoss : metrics.expectancy;
  const payoffRatio = avgLoss > 0 ? avgWin / avgLoss : metrics.payoff_ratio;
  const realizedPnl = trades.length > 0 ? trades.reduce((sum, trade) => sum + trade.pnl, 0) : metrics.realized_pnl;
  const exposureLong = positions
    .filter((position) => position.direction === 'LONG')
    .reduce((sum, position) => sum + position.entry_notional, 0);
  const exposureShort = positions
    .filter((position) => position.direction === 'SHORT')
    .reduce((sum, position) => sum + position.entry_notional, 0);
  const riskAtStop = positions.reduce((sum, position) => {
    return sum + position.entry_notional * (Math.max(position.stop_pct, 0) / 100);
  }, 0);
  const maxDrawdownPct = metrics.max_drawdown_pct || calculateMaxDrawdownPct(equityCurve, metrics.initial_balance);

  return {
    ...metrics,
    equity: metrics.equity || metrics.wallet_balance + metrics.unrealized_pnl,
    realized_pnl: realizedPnl,
    pnl_today: metrics.pnl_today || sumPnlSince(trades, 1),
    pnl_7d: metrics.pnl_7d || sumPnlSince(trades, 7),
    exposure_long: metrics.exposure_long || exposureLong,
    exposure_short: metrics.exposure_short || exposureShort,
    exposure_total: metrics.exposure_total || exposureLong + exposureShort,
    risk_at_stop: metrics.risk_at_stop || riskAtStop,
    open_positions_count: positions.length || metrics.open_positions_count,
    closed_trades_count: closedTrades,
    win_rate: winRate,
    profit_factor: metrics.profit_factor || (grossLossesAbs > 0 ? grossWins / grossLossesAbs : 0),
    expectancy,
    payoff_ratio: payoffRatio,
    avg_win: avgWin,
    avg_loss: avgLoss,
    max_drawdown_pct: maxDrawdownPct,
    recovery_factor: metrics.recovery_factor || (maxDrawdownPct > 0 ? realizedPnl / (metrics.initial_balance * maxDrawdownPct / 100) : 0),
    best_trade: trades.length > 0 ? Math.max(...trades.map((trade) => trade.pnl)) : metrics.best_trade,
    worst_trade: trades.length > 0 ? Math.min(...trades.map((trade) => trade.pnl)) : metrics.worst_trade,
    total_trades: closedTrades + positions.length,
    trades_today: metrics.trades_today || trades.filter((trade) => isWithinDays(trade.exit_time, 1)).length,
    longs_count: metrics.longs_count || positions.filter((position) => position.direction === 'LONG').length,
    shorts_count: metrics.shorts_count || positions.filter((position) => position.direction === 'SHORT').length,
    last_signal_time: metrics.last_signal_time || trades[0]?.exit_time || '',
  };
}

function sumPnlSince(trades: Trade[], days: number): number {
  return trades
    .filter((trade) => isWithinDays(trade.exit_time, days))
    .reduce((sum, trade) => sum + trade.pnl, 0);
}

function isWithinDays(rawDate: string, days: number): boolean {
  const timestamp = new Date(rawDate).getTime();
  if (!Number.isFinite(timestamp)) return false;
  return Date.now() - timestamp <= days * 24 * 60 * 60 * 1000;
}

function calculateMaxDrawdownPct(equityCurve: EquityPoint[], initialBalance: number): number {
  let peak = initialBalance;
  let maxDrawdown = 0;
  for (const point of equityCurve) {
    peak = Math.max(peak, point.balance);
    if (peak > 0) {
      maxDrawdown = Math.max(maxDrawdown, ((peak - point.balance) / peak) * 100);
    }
  }
  return maxDrawdown;
}

function normalizeHealthState(value: unknown): HealthState {
  const status = asString(value, 'unhealthy');
  if (status === 'healthy' || status === 'checking') return status;
  return 'unhealthy';
}

function normalizeHealthComponent(value: unknown, fallbackMessage: string): HealthPayload['api'] {
  const source = isRecord(value) ? value : {};
  return {
    status: normalizeHealthState(source.status),
    message: asString(source.message, fallbackMessage),
    response_time_ms: asNumber(source.response_time_ms, 0),
    last_event_ts: asString(source.last_event_ts, ''),
  };
}

function normalizeHealthPayload(value: unknown): HealthPayload {
  const source = isRecord(value) ? value : {};
  return {
    api: normalizeHealthComponent(source.api, 'API status unavailable'),
    database: normalizeHealthComponent(source.database, 'Database status unavailable'),
    event_journal: normalizeHealthComponent(source.event_journal, 'Event journal status unavailable'),
    current_time: asString(source.current_time, new Date().toISOString()),
    version: asString(source.version, ''),
    environment: asString(source.environment, import.meta.env.MODE),
  };
}

export const dashboardApi = {
  async getDashboard(): Promise<DashboardPayload> {
    if (isDemoMode()) {
      return generateDemoDashboardPayload();
    }
    
    const response = await apiClient.get('/dashboard');
    return normalizeDashboardPayload(response.data);
  },

  async getDashboardWithFilters(params: {
    date_from?: string;
    date_to?: string;
    symbols?: string[];
    direction?: string;
    exit_reasons?: string[];
  }): Promise<DashboardPayload> {
    if (isDemoMode()) {
      return generateDemoDashboardPayload();
    }
    
    const queryParams = new URLSearchParams();
    
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.direction) queryParams.append('direction', params.direction);
    
    params.symbols?.forEach(sym => {
      if (sym.trim()) queryParams.append('symbols', sym.trim());
    });
    
    params.exit_reasons?.forEach(reason => {
      if (reason.trim()) queryParams.append('exit_reasons', reason.trim());
    });

    const response = await apiClient.get(`/dashboard?${queryParams.toString()}`);
    return normalizeDashboardPayload(response.data);
  },

  async getMetrics(): Promise<DashboardMetrics> {
    if (isDemoMode()) {
      const payload = generateDemoDashboardPayload();
      return payload.metrics;
    }
    
    const response = await apiClient.get('/metrics');
    return normalizeMetrics(response.data);
  },

  async getPositions(): Promise<OpenPosition[]> {
    if (isDemoMode()) {
      const payload = generateDemoDashboardPayload();
      return payload.open_positions;
    }
    
    const response = await apiClient.get('/positions');
    return Array.isArray(response.data) ? response.data.map(normalizePosition) : [];
  },

  async getTrades(limit: number = 100, filters?: {
    date_from?: string;
    date_to?: string;
    symbols?: string[];
    direction?: string;
    exit_reasons?: string[];
  }): Promise<Trade[]> {
    if (isDemoMode()) {
      const payload = generateDemoDashboardPayload();
      return payload.recent_trades.slice(0, limit);
    }
    
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit.toString());
    
    if (filters) {
      if (filters.date_from) queryParams.append('date_from', filters.date_from);
      if (filters.date_to) queryParams.append('date_to', filters.date_to);
      if (filters.direction) queryParams.append('direction', filters.direction);
      
      filters.symbols?.forEach(sym => {
        if (sym.trim()) queryParams.append('symbols', sym.trim());
      });
      
      filters.exit_reasons?.forEach(reason => {
        if (reason.trim()) queryParams.append('exit_reasons', reason.trim());
      });
    }

    const response = await apiClient.get(`/trades?${queryParams.toString()}`);
    return Array.isArray(response.data) ? response.data.map(normalizeTrade) : [];
  },

  async getEquity(filters?: {
    date_from?: string;
    date_to?: string;
    symbols?: string[];
    direction?: string;
    exit_reasons?: string[];
  }): Promise<EquityPoint[]> {
    if (isDemoMode()) {
      const payload = generateDemoDashboardPayload();
      return payload.equity_curve;
    }
    
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.date_from) queryParams.append('date_from', filters.date_from);
      if (filters.date_to) queryParams.append('date_to', filters.date_to);
      if (filters.direction) queryParams.append('direction', filters.direction);
      
      filters.symbols?.forEach(sym => {
        if (sym.trim()) queryParams.append('symbols', sym.trim());
      });
      
      filters.exit_reasons?.forEach(reason => {
        if (reason.trim()) queryParams.append('exit_reasons', reason.trim());
      });
    }

    const response = await apiClient.get(`/equity?${queryParams.toString()}`);
    return Array.isArray(response.data) ? response.data.map(normalizeEquityPoint) : [];
  },

  async getHealth(): Promise<HealthPayload> {
    if (isDemoMode()) {
      return {
        api: { status: 'healthy', message: 'Demo mode API stub' },
        database: { status: 'healthy', message: 'Demo mode database stub' },
        event_journal: { status: 'healthy', message: 'Demo mode journal stub' },
        current_time: new Date().toISOString(),
        environment: import.meta.env.MODE,
      };
    }

    try {
      const response = await apiClient.get('/health');
      return normalizeHealthPayload(response.data);
    } catch {
      const startedAt = performance.now();
      await this.getMetrics();
      const responseTime = Math.round(performance.now() - startedAt);
      return {
        api: { status: 'healthy', message: 'Metrics endpoint responded', response_time_ms: responseTime },
        database: {
          status: 'checking',
          message: 'Dedicated /health endpoint is not available; database status was not reported separately',
        },
        event_journal: {
          status: 'checking',
          message: 'Dedicated /health endpoint is not available; journal status was not reported separately',
        },
        current_time: new Date().toISOString(),
        environment: import.meta.env.MODE,
      };
    }
  },
};
