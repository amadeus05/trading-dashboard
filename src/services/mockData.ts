import type { DashboardPayload, DashboardMetrics, OpenPosition, Trade, EquityPoint } from '../types';

// Demo data from paper_web.py
const DEMO_SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'BNB/USDT', 'ADA/USDT', 'DOGE/USDT', 'MATIC/USDT', 'AVAX/USDT', 'DOT/USDT'];
const DEMO_EXIT_REASONS = ['TP', 'SL', 'timeout', 'manual', 'trailing_stop'];

const INITIAL_BALANCE = 10000;

// Generate demo trades
function generateDemoTrades(count: number = 50): Trade[] {
  const trades: Trade[] = [];
  const now = new Date();
  
  // More diverse P&L values for better Asset Heat visualization
  const rawTrades = [
    // BTC - Big winner (matches the +34% from screenshot style)
    { symbol: 'BTC/USDT', direction: 'LONG' as const, entry: 68420.0, exit: 69180.0, notional: 120.0, pnl: 34.5, pnlPct: 34.5, reason: 'TP', isWin: true },
    // ETH - Good winner (+22% style)
    { symbol: 'ETH/USDT', direction: 'LONG' as const, entry: 3528.0, exit: 3562.0, notional: 90.0, pnl: 22.3, pnlPct: 22.3, reason: 'TP', isWin: true },
    // SOL - Moderate winner (+17% style)
    { symbol: 'SOL/USDT', direction: 'LONG' as const, entry: 182.4, exit: 186.7, notional: 85.0, pnl: 17.8, pnlPct: 17.8, reason: 'TP', isWin: true },
    // XRP - Small loser (-4% style)
    { symbol: 'XRP/USDT', direction: 'SHORT' as const, entry: 0.6421, exit: 0.6355, notional: 70.0, pnl: -4.2, pnlPct: -4.2, reason: 'SL', isWin: false },
    // BNB - Small winner
    { symbol: 'BNB/USDT', direction: 'LONG' as const, entry: 602.3, exit: 598.4, notional: 95.0, pnl: 8.5, pnlPct: 8.5, reason: 'TP', isWin: true },
    // ADA - Moderate loser
    { symbol: 'ADA/USDT', direction: 'LONG' as const, entry: 0.485, exit: 0.512, notional: 60.0, pnl: -12.4, pnlPct: -12.4, reason: 'SL', isWin: false },
    // DOGE - Small winner
    { symbol: 'DOGE/USDT', direction: 'SHORT' as const, entry: 0.085, exit: 0.082, notional: 55.0, pnl: 6.8, pnlPct: 6.8, reason: 'trailing_stop', isWin: true },
    // MATIC - Big loser
    { symbol: 'MATIC/USDT', direction: 'LONG' as const, entry: 0.72, exit: 0.68, notional: 75.0, pnl: -18.5, pnlPct: -18.5, reason: 'SL', isWin: false },
    // AVAX - Winner
    { symbol: 'AVAX/USDT', direction: 'LONG' as const, entry: 42.5, exit: 45.2, notional: 80.0, pnl: 15.2, pnlPct: 15.2, reason: 'TP', isWin: true },
    // DOT - Small loser
    { symbol: 'DOT/USDT', direction: 'SHORT' as const, entry: 7.85, exit: 7.92, notional: 65.0, pnl: -7.3, pnlPct: -7.3, reason: 'SL', isWin: false },
  ];
  
  for (let i = 0; i < count; i++) {
    const baseTrade = rawTrades[i % rawTrades.length];
    const hoursAgo = i * 2 + Math.floor(Math.random() * 4);
    const exitTime = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    
    // Add some randomness
    const pnlVariation = (Math.random() - 0.5) * 2;
    const finalPnl = baseTrade.pnl + pnlVariation;
    
    trades.push({
      symbol: baseTrade.symbol,
      direction: baseTrade.direction,
      entry_price: baseTrade.entry,
      exit_price: baseTrade.exit,
      notional: baseTrade.notional,
      pnl: Number(finalPnl.toFixed(2)),
      pnl_pct: baseTrade.pnlPct,
      exit_reason: baseTrade.reason,
      exit_time: exitTime.toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
      is_win: finalPnl > 0,
      entry_time: new Date(exitTime.getTime() - (2 + (i % 8)) * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
      duration_minutes: (2 + (i % 8)) * 60,
      fee: Number((baseTrade.notional * 0.0008).toFixed(3)),
      p_long: baseTrade.direction === 'LONG' ? 0.58 + (i % 5) * 0.04 : 0.32 + (i % 4) * 0.03,
      p_short: baseTrade.direction === 'SHORT' ? 0.59 + (i % 5) * 0.04 : 0.31 + (i % 4) * 0.03,
      signal_gap: 0.08 + (i % 6) * 0.025,
      risk_pct: 0.75 + (i % 4) * 0.15,
    });
  }
  
  return trades;
}

// Generate demo equity curve
function generateDemoEquityCurve(trades: Trade[]): EquityPoint[] {
  const equity: EquityPoint[] = [];
  let balance = INITIAL_BALANCE;
  
  // Sort trades by exit time
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.exit_time).getTime() - new Date(b.exit_time).getTime()
  );
  
  for (const trade of sortedTrades) {
    balance += trade.pnl;
    equity.push({
      time: trade.exit_time.replace(' UTC', ''),
      balance: Number(balance.toFixed(2)),
    });
  }
  
  return equity;
}

// Generate demo open positions
function generateDemoOpenPositions(count: number = 3): OpenPosition[] {
  const positions: OpenPosition[] = [];
  const symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'];
  
  for (let i = 0; i < count; i++) {
    positions.push({
      id: `demo-pos-${i}`,
      symbol: symbols[i % symbols.length],
      direction: i % 2 === 0 ? 'LONG' : 'SHORT',
      entry_price: i % 2 === 0 ? 69150.0 + i * 100 : 3550.0 + i * 10,
      entry_notional: 100.0 + i * 25,
      stop_pct: 2.5 + i * 0.5,
      take_pct: 5.0 + i,
      p_long: i % 2 === 0 ? 0.75 : 0.45,
      p_short: i % 2 === 0 ? 0.25 : 0.85,
      entry_time: '-',
    });
  }
  
  return positions;
}

// Calculate metrics from trades
function calculateMetrics(trades: Trade[], openPositions: OpenPosition[]): DashboardMetrics {
  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl <= 0);
  
  const winCount = wins.length;
  const lossCount = losses.length;
  const totalClosed = trades.length;
  
  const totalWins = wins.reduce((sum, t) => sum + t.pnl, 0);
  const totalLosses = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
  
  const realizedPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const walletBalance = INITIAL_BALANCE + realizedPnl;
  const unrealizedPnl = openPositions.reduce((sum, _position, idx) => sum + (idx % 2 === 0 ? 4.5 : -2.8), 0);
  const equity = walletBalance + unrealizedPnl;
  
  // Calculate max drawdown
  let peak = INITIAL_BALANCE;
  let maxDrawdown = 0.0;
  let currentBalance = INITIAL_BALANCE;
  
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.exit_time).getTime() - new Date(b.exit_time).getTime()
  );
  
  for (const trade of sortedTrades) {
    currentBalance += trade.pnl;
    if (currentBalance > peak) {
      peak = currentBalance;
    }
    if (peak > 0) {
      const dd = ((peak - currentBalance) / peak) * 100;
      maxDrawdown = Math.max(maxDrawdown, dd);
    }
  }
  
  // Longs/shorts count from open positions
  const longsCount = openPositions.filter(p => p.direction === 'LONG').length;
  const shortsCount = openPositions.filter(p => p.direction === 'SHORT').length;
  
  const openMargin = openPositions.reduce((sum, p) => sum + p.entry_notional / 10, 0);
  const exposureLong = openPositions.filter(p => p.direction === 'LONG').reduce((sum, p) => sum + p.entry_notional, 0);
  const exposureShort = openPositions.filter(p => p.direction === 'SHORT').reduce((sum, p) => sum + p.entry_notional, 0);
  const riskAtStop = openPositions.reduce((sum, p) => sum + p.entry_notional * (p.stop_pct / 100), 0);
  const expectancy = totalClosed > 0 ? (winCount / totalClosed) * (winCount > 0 ? totalWins / winCount : 0) - (lossCount / totalClosed) * (lossCount > 0 ? totalLosses / lossCount : 0) : 0;
  const payoffRatio = lossCount > 0 && totalLosses > 0 ? (totalWins / Math.max(winCount, 1)) / (totalLosses / lossCount) : 0;
  
  return {
    exchange: 'BYBIT',
    timeframe: '1h',
    htf_timeframe: '4h',
    leverage: 10,
    initial_balance: INITIAL_BALANCE,
    equity,
    wallet_balance: walletBalance,
    realized_pnl: realizedPnl,
    unrealized_pnl: unrealizedPnl,
    pnl_today: trades.filter(t => new Date(t.exit_time).getTime() > Date.now() - 24 * 60 * 60 * 1000).reduce((sum, t) => sum + t.pnl, 0),
    pnl_7d: trades.filter(t => new Date(t.exit_time).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000).reduce((sum, t) => sum + t.pnl, 0),
    open_margin: openMargin,
    available_balance: walletBalance - openMargin,
    exposure_total: exposureLong + exposureShort,
    exposure_long: exposureLong,
    exposure_short: exposureShort,
    risk_at_stop: riskAtStop,
    open_positions_count: openPositions.length,
    closed_trades_count: totalClosed,
    win_rate: totalClosed > 0 ? (winCount / totalClosed) * 100 : 0,
    profit_factor: totalLosses > 0 ? totalWins / totalLosses : 0,
    expectancy,
    payoff_ratio: payoffRatio,
    avg_win: winCount > 0 ? totalWins / winCount : 0,
    avg_loss: lossCount > 0 ? totalLosses / lossCount : 0,
    max_drawdown_pct: maxDrawdown,
    recovery_factor: maxDrawdown > 0 ? realizedPnl / (INITIAL_BALANCE * maxDrawdown / 100) : 0,
    best_trade: Math.max(...trades.map(t => t.pnl), 0),
    worst_trade: Math.min(...trades.map(t => t.pnl), 0),
    total_trades: totalClosed + openPositions.length,
    trades_today: trades.filter(t => new Date(t.exit_time).getTime() > Date.now() - 24 * 60 * 60 * 1000).length,
    longs_count: longsCount,
    shorts_count: shortsCount,
    last_market_event_time: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
    last_signal_time: trades[0]?.exit_time || '',
    system_status: 'running',
    filtered_realized_pnl: realizedPnl,
    filtered_win_rate: totalClosed > 0 ? (winCount / totalClosed) * 100 : 0,
    filtered_trades_count: totalClosed,
  };
}

// Generate complete demo payload
export function generateDemoDashboardPayload(): DashboardPayload {
  const trades = generateDemoTrades(25);
  const openPositions = generateDemoOpenPositions(3);
  const equityCurve = generateDemoEquityCurve(trades);
  const metrics = calculateMetrics(trades, openPositions);
  
  return {
    app: {
      app_title: import.meta.env.VITE_APP_TITLE || 'Trading Bot Dashboard',
      bot_name: import.meta.env.VITE_BOT_NAME || 'Demo Trading Bot',
      mode: 'demo',
      exchange: 'BYBIT',
      strategy: 'demo-preview',
      environment: import.meta.env.MODE,
    },
    metrics,
    open_positions: openPositions,
    recent_trades: trades.slice(0, 20),
    equity_curve: equityCurve,
    filters: {
      date_from: '',
      date_to: '',
      symbols: [],
      direction: '',
      exit_reasons: [],
      has_active_filters: false,
      all_symbols: DEMO_SYMBOLS,
      all_exit_reasons: DEMO_EXIT_REASONS,
    },
    demo_mode: true,
    demo_message: 'Демо-режим: показаны фейковые данные для превью',
    current_time: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
  };
}

// Check if demo mode is enabled
export const isDemoMode = (): boolean => {
  return import.meta.env.VITE_DEMO_MODE === 'true' || import.meta.env.VITE_DEMO_MODE === '1';
};
