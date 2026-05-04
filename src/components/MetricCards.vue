<script setup lang="ts">
import { computed } from 'vue';
import {
  BanknotesIcon,
  BoltIcon,
  ChartBarIcon,
  ShieldExclamationIcon,
} from '@heroicons/vue/24/outline';
import type { DashboardMetrics } from '../types';

interface Props {
  metrics: DashboardMetrics;
}

const props = defineProps<Props>();

function formatCurrency(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}

function formatPlainCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

const equityDelta = computed(() => props.metrics.equity - props.metrics.initial_balance);
const riskUsagePct = computed(() => {
  if (props.metrics.equity <= 0) return 0;
  return (props.metrics.risk_at_stop / props.metrics.equity) * 100;
});
const systemStatusClass = computed(() => {
  if (props.metrics.system_status === 'error') return 'text-red-400';
  if (props.metrics.system_status === 'paused') return 'text-amber-400';
  if (props.metrics.system_status === 'idle') return 'text-slate-400';
  return 'text-emerald-400';
});
const systemStatusLabel = computed(() => {
  const map: Record<DashboardMetrics['system_status'], string> = {
    running: 'RUNNING',
    paused: 'PAUSED',
    error: 'ERROR',
    idle: 'IDLE',
  };
  return map[props.metrics.system_status];
});
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
    <div class="metric-card rounded-xl p-5">
      <div class="flex items-center justify-between mb-3">
        <span class="text-slate-400 text-sm font-medium">Equity</span>
        <BanknotesIcon class="w-5 h-5 text-indigo-400" />
      </div>
      <div class="text-2xl font-bold text-white">{{ formatPlainCurrency(metrics.equity) }}</div>
      <div class="text-xs mt-2" :class="equityDelta >= 0 ? 'positive' : 'negative'">
        Net: {{ formatCurrency(equityDelta) }} | Realized {{ formatCurrency(metrics.realized_pnl) }}
      </div>
    </div>

    <div class="metric-card rounded-xl p-5">
      <div class="flex items-center justify-between mb-3">
        <span class="text-slate-400 text-sm font-medium">Today P&L</span>
        <ChartBarIcon class="w-5 h-5 text-cyan-400" />
      </div>
      <div class="text-2xl font-bold" :class="metrics.pnl_today >= 0 ? 'positive' : 'negative'">
        {{ formatCurrency(metrics.pnl_today) }}
      </div>
      <div class="text-xs text-slate-400 mt-2">
        {{ metrics.trades_today }} trades today | 7d {{ formatCurrency(metrics.pnl_7d) }}
      </div>
    </div>

    <div class="metric-card rounded-xl p-5">
      <div class="flex items-center justify-between mb-3">
        <span class="text-slate-400 text-sm font-medium">Open Risk</span>
        <ShieldExclamationIcon class="w-5 h-5 text-amber-400" />
      </div>
      <div class="text-2xl font-bold text-white">{{ formatPlainCurrency(metrics.risk_at_stop) }}</div>
      <div class="text-xs text-slate-400 mt-2">
        {{ riskUsagePct.toFixed(2) }}% equity | Exposure {{ formatPlainCurrency(metrics.exposure_total) }}
      </div>
    </div>

    <div class="metric-card rounded-xl p-5">
      <div class="flex items-center justify-between mb-3">
        <span class="text-slate-400 text-sm font-medium">System State</span>
        <BoltIcon class="w-5 h-5 text-emerald-400" />
      </div>
      <div class="text-2xl font-bold" :class="systemStatusClass">{{ systemStatusLabel }}</div>
      <div class="text-xs text-slate-400 mt-2">
        {{ metrics.open_positions_count }} open | Last signal {{ metrics.last_signal_time || 'n/a' }}
      </div>
    </div>
  </div>
</template>
