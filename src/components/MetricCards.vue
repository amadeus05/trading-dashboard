<script setup lang="ts">
import { computed } from 'vue';
import { WalletIcon, LockOpenIcon, ChartPieIcon, PresentationChartLineIcon } from '@heroicons/vue/24/outline';
import type { DashboardMetrics } from '../types';

interface Props {
  metrics: DashboardMetrics;
}

const props = defineProps<Props>();

const walletBalanceFormatted = computed(() => {
  return `$${props.metrics.wallet_balance.toFixed(2)}`;
});

const availableBalanceFormatted = computed(() => {
  return `$${props.metrics.available_balance.toFixed(2)}`;
});

const realizedPnlFormatted = computed(() => {
  const sign = props.metrics.realized_pnl >= 0 ? '+' : '';
  return `${sign}$${props.metrics.realized_pnl.toFixed(2)}`;
});

const winRateFormatted = computed(() => {
  return `${props.metrics.win_rate.toFixed(1)}%`;
});

const isWinRatePositive = computed(() => {
  return props.metrics.win_rate >= 50;
});
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <!-- Wallet Balance -->
    <div class="metric-card rounded-xl p-5">
      <div class="flex items-center justify-between mb-2">
        <span class="text-slate-400 text-sm font-medium">Баланс кошелька</span>
        <WalletIcon class="w-5 h-5 text-indigo-400" />
      </div>
      <div class="text-2xl font-bold text-white">{{ walletBalanceFormatted }}</div>
      <div 
        class="text-xs mt-1"
        :class="metrics.realized_pnl >= 0 ? 'positive' : 'negative'"
      >
        P&L: {{ realizedPnlFormatted }}
      </div>
    </div>

    <!-- Available Balance -->
    <div class="metric-card rounded-xl p-5">
      <div class="flex items-center justify-between mb-2">
        <span class="text-slate-400 text-sm font-medium">Доступно</span>
        <LockOpenIcon class="w-5 h-5 text-emerald-400" />
      </div>
      <div class="text-2xl font-bold text-white">{{ availableBalanceFormatted }}</div>
      <div class="text-xs text-slate-400 mt-1">
        Маржа занята: ${{ metrics.open_margin.toFixed(2) }}
      </div>
    </div>

    <!-- Open Positions -->
    <div class="metric-card rounded-xl p-5">
      <div class="flex items-center justify-between mb-2">
        <span class="text-slate-400 text-sm font-medium">Открытые позиции</span>
        <ChartPieIcon class="w-5 h-5 text-amber-400" />
      </div>
      <div class="text-2xl font-bold text-white">{{ metrics.open_positions_count }} / {{ metrics.total_trades }}</div>
      <div class="text-xs text-slate-400 mt-1">
        LONG: {{ metrics.longs_count }} | SHORT: {{ metrics.shorts_count }}
      </div>
    </div>

    <!-- Win Rate -->
    <div class="metric-card rounded-xl p-5">
      <div class="flex items-center justify-between mb-2">
        <span class="text-slate-400 text-sm font-medium">Win Rate</span>
        <PresentationChartLineIcon class="w-5 h-5 text-purple-400" />
      </div>
      <div 
        class="text-2xl font-bold"
        :class="isWinRatePositive ? 'positive' : 'negative'"
      >
        {{ winRateFormatted }}
      </div>
      <div class="text-xs text-slate-400 mt-1">
        Profit Factor: {{ metrics.profit_factor.toFixed(2) }}
      </div>
    </div>
  </div>
</template>
