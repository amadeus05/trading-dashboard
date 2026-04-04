<script setup lang="ts">
import type { DashboardMetrics } from '../types';

interface Props {
  metrics: DashboardMetrics;
}

defineProps<Props>();
</script>

<template>
  <div class="glass-panel rounded-xl p-5">
    <h3 class="text-lg font-semibold text-white mb-4">Статистика торговли</h3>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <!-- Avg Win -->
      <div class="bg-slate-800/50 rounded-lg p-3">
        <div class="text-xs text-slate-400">Avg Win</div>
        <div class="text-lg font-semibold positive">${{ metrics.avg_win.toFixed(2) }}</div>
      </div>
      
      <!-- Avg Loss -->
      <div class="bg-slate-800/50 rounded-lg p-3">
        <div class="text-xs text-slate-400">Avg Loss</div>
        <div class="text-lg font-semibold negative">${{ metrics.avg_loss.toFixed(2) }}</div>
      </div>
      
      <!-- Best Trade -->
      <div class="bg-slate-800/50 rounded-lg p-3">
        <div class="text-xs text-slate-400">Best Trade</div>
        <div class="text-lg font-semibold positive">${{ metrics.best_trade.toFixed(2) }}</div>
      </div>
      
      <!-- Worst Trade -->
      <div class="bg-slate-800/50 rounded-lg p-3">
        <div class="text-xs text-slate-400">Worst Trade</div>
        <div class="text-lg font-semibold negative">${{ metrics.worst_trade.toFixed(2) }}</div>
      </div>
      
      <!-- Max Drawdown -->
      <div class="bg-slate-800/50 rounded-lg p-3">
        <div class="text-xs text-slate-400">Max Drawdown</div>
        <div class="text-lg font-semibold text-orange-400">{{ metrics.max_drawdown_pct.toFixed(2) }}%</div>
      </div>
      
      <!-- Total Trades -->
      <div class="bg-slate-800/50 rounded-lg p-3">
        <div class="text-xs text-slate-400">Всего сделок</div>
        <div class="text-lg font-semibold text-white">{{ metrics.total_trades }}</div>
      </div>
      
      <!-- Closed Trades -->
      <div class="bg-slate-800/50 rounded-lg p-3">
        <div class="text-xs text-slate-400">Закрытые</div>
        <div class="text-lg font-semibold text-white">{{ metrics.closed_trades_count }}</div>
      </div>
      
      <!-- Initial Balance -->
      <div class="bg-slate-800/50 rounded-lg p-3">
        <div class="text-xs text-slate-400">Начальный баланс</div>
        <div class="text-lg font-semibold text-white">${{ metrics.initial_balance.toFixed(2) }}</div>
      </div>
    </div>
  </div>
</template>
