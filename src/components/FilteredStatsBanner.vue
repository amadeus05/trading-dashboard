<script setup lang="ts">
import type { DashboardMetrics } from '../types';

interface Props {
  metrics: DashboardMetrics;
}

defineProps<Props>();
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <!-- Filtered PnL -->
    <div class="metric-card rounded-xl p-4 border-l-4 border-indigo-500">
      <div class="text-xs text-slate-400 mb-1">Отфильтрованный P&L</div>
      <div 
        class="text-xl font-bold"
        :class="(metrics.filtered_realized_pnl || 0) >= 0 ? 'positive' : 'negative'"
      >
        {{ (metrics.filtered_realized_pnl || 0) >= 0 ? '+' : '' }}${{ (metrics.filtered_realized_pnl || 0).toFixed(2) }}
      </div>
    </div>
    
    <!-- Filtered Win Rate -->
    <div class="metric-card rounded-xl p-4 border-l-4 border-purple-500">
      <div class="text-xs text-slate-400 mb-1">Отфильтрованный Win Rate</div>
      <div 
        class="text-xl font-bold"
        :class="(metrics.filtered_win_rate || 0) >= 50 ? 'positive' : 'negative'"
      >
        {{ (metrics.filtered_win_rate || 0).toFixed(1) }}%
      </div>
    </div>
    
    <!-- Filtered Trades Count -->
    <div class="metric-card rounded-xl p-4 border-l-4 border-amber-500">
      <div class="text-xs text-slate-400 mb-1">Отфильтровано сделок</div>
      <div class="text-xl font-bold text-white">
        {{ metrics.filtered_trades_count || 0 }}
      </div>
    </div>
  </div>
</template>
