<script setup lang="ts">
import { computed } from 'vue';
import type { DashboardMetrics, Trade } from '../types';

interface Props {
  metrics: DashboardMetrics;
  trades: Trade[];
}

const props = defineProps<Props>();

function formatCurrency(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}

function formatRatio(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : '0.00';
}

const longTrades = computed(() => props.trades.filter((trade) => trade.direction === 'LONG'));
const shortTrades = computed(() => props.trades.filter((trade) => trade.direction === 'SHORT'));

function pnlFor(trades: Trade[]): number {
  return trades.reduce((sum, trade) => sum + trade.pnl, 0);
}

function winRateFor(trades: Trade[]): number {
  if (trades.length === 0) return 0;
  return (trades.filter((trade) => trade.pnl > 0).length / trades.length) * 100;
}

const signalBuckets = computed(() => {
  const buckets = [
    { label: '0.55-0.60', min: 0.55, max: 0.6, trades: [] as Trade[] },
    { label: '0.60-0.70', min: 0.6, max: 0.7, trades: [] as Trade[] },
    { label: '0.70+', min: 0.7, max: Number.POSITIVE_INFINITY, trades: [] as Trade[] },
  ];

  for (const trade of props.trades) {
    const confidence = Math.max(trade.p_long || 0, trade.p_short || 0);
    const bucket = buckets.find((item) => confidence >= item.min && confidence < item.max);
    if (bucket) bucket.trades.push(trade);
  }

  return buckets.map((bucket) => ({
    label: bucket.label,
    count: bucket.trades.length,
    pnl: pnlFor(bucket.trades),
    winRate: winRateFor(bucket.trades),
  }));
});

const averageSignalGap = computed(() => {
  const gaps = props.trades
    .map((trade) => trade.signal_gap)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  if (gaps.length === 0) return 0;
  return gaps.reduce((sum, value) => sum + value, 0) / gaps.length;
});
</script>

<template>
  <div class="space-y-6">
    <div class="glass-panel rounded-xl p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-white">Performance</h3>
        <span class="text-xs text-slate-400">{{ metrics.closed_trades_count }} closed trades</span>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-slate-800/50 rounded-lg p-3">
          <div class="text-xs text-slate-400">Expectancy</div>
          <div class="text-lg font-semibold" :class="metrics.expectancy >= 0 ? 'positive' : 'negative'">
            {{ formatCurrency(metrics.expectancy) }}
          </div>
        </div>
        <div class="bg-slate-800/50 rounded-lg p-3">
          <div class="text-xs text-slate-400">Profit Factor</div>
          <div class="text-lg font-semibold text-white">{{ formatRatio(metrics.profit_factor) }}</div>
        </div>
        <div class="bg-slate-800/50 rounded-lg p-3">
          <div class="text-xs text-slate-400">Payoff Ratio</div>
          <div class="text-lg font-semibold text-white">{{ formatRatio(metrics.payoff_ratio) }}</div>
        </div>
        <div class="bg-slate-800/50 rounded-lg p-3">
          <div class="text-xs text-slate-400">Win Rate</div>
          <div class="text-lg font-semibold" :class="metrics.win_rate >= 50 ? 'positive' : 'negative'">
            {{ metrics.win_rate.toFixed(1) }}%
          </div>
        </div>
        <div class="bg-slate-800/50 rounded-lg p-3">
          <div class="text-xs text-slate-400">Avg Win</div>
          <div class="text-lg font-semibold positive">{{ formatCurrency(metrics.avg_win) }}</div>
        </div>
        <div class="bg-slate-800/50 rounded-lg p-3">
          <div class="text-xs text-slate-400">Avg Loss</div>
          <div class="text-lg font-semibold negative">{{ formatCurrency(-metrics.avg_loss) }}</div>
        </div>
        <div class="bg-slate-800/50 rounded-lg p-3">
          <div class="text-xs text-slate-400">Max Drawdown</div>
          <div class="text-lg font-semibold text-orange-400">{{ metrics.max_drawdown_pct.toFixed(2) }}%</div>
        </div>
        <div class="bg-slate-800/50 rounded-lg p-3">
          <div class="text-xs text-slate-400">Recovery Factor</div>
          <div class="text-lg font-semibold text-white">{{ formatRatio(metrics.recovery_factor) }}</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="glass-panel rounded-xl p-5">
        <h3 class="text-lg font-semibold text-white mb-4">Risk</h3>
        <div class="space-y-3 text-sm">
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Total exposure</span>
            <span class="text-white font-medium">{{ formatCurrency(metrics.exposure_total) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Long / Short exposure</span>
            <span class="text-white font-medium">
              {{ formatCurrency(metrics.exposure_long) }} / {{ formatCurrency(metrics.exposure_short) }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Risk at stop</span>
            <span class="text-amber-400 font-medium">{{ formatCurrency(metrics.risk_at_stop) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Margin used</span>
            <span class="text-white font-medium">{{ formatCurrency(metrics.open_margin) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Available balance</span>
            <span class="text-white font-medium">{{ formatCurrency(metrics.available_balance) }}</span>
          </div>
        </div>
      </div>

      <div class="glass-panel rounded-xl p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">Signal Quality</h3>
          <span class="text-xs text-slate-400">Avg gap {{ averageSignalGap.toFixed(3) }}</span>
        </div>

        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="bg-slate-800/50 rounded-lg p-3">
            <div class="text-xs text-slate-400">LONG P&L</div>
            <div class="text-lg font-semibold" :class="pnlFor(longTrades) >= 0 ? 'positive' : 'negative'">
              {{ formatCurrency(pnlFor(longTrades)) }}
            </div>
            <div class="text-xs text-slate-500">{{ longTrades.length }} trades | {{ winRateFor(longTrades).toFixed(1) }}%</div>
          </div>
          <div class="bg-slate-800/50 rounded-lg p-3">
            <div class="text-xs text-slate-400">SHORT P&L</div>
            <div class="text-lg font-semibold" :class="pnlFor(shortTrades) >= 0 ? 'positive' : 'negative'">
              {{ formatCurrency(pnlFor(shortTrades)) }}
            </div>
            <div class="text-xs text-slate-500">{{ shortTrades.length }} trades | {{ winRateFor(shortTrades).toFixed(1) }}%</div>
          </div>
        </div>

        <div class="space-y-2">
          <div
            v-for="bucket in signalBuckets"
            :key="bucket.label"
            class="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2 text-sm"
          >
            <span class="text-slate-300">{{ bucket.label }}</span>
            <span class="text-slate-400">{{ bucket.count }} trades</span>
            <span :class="bucket.pnl >= 0 ? 'positive' : 'negative'">{{ formatCurrency(bucket.pnl) }}</span>
            <span class="text-slate-400">{{ bucket.winRate.toFixed(1) }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
