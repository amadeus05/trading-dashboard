<script setup lang="ts">
import { computed } from 'vue';
import { FireIcon } from '@heroicons/vue/24/outline';
import type { Trade } from '../types';

interface Props {
  trades: Trade[];
}

const props = defineProps<Props>();

// Calculate P&L per symbol
const assetHeatData = computed(() => {
  const symbolStats = new Map<string, { pnl: number; trades: number; wins: number }>();
  
  for (const trade of props.trades) {
    const existing = symbolStats.get(trade.symbol);
    if (existing) {
      existing.pnl += trade.pnl;
      existing.trades += 1;
      if (trade.is_win) existing.wins += 1;
    } else {
      symbolStats.set(trade.symbol, {
        pnl: trade.pnl,
        trades: 1,
        wins: trade.is_win ? 1 : 0,
      });
    }
  }
  
  // Convert to array and sort by absolute P&L (highest first)
  const assets = Array.from(symbolStats.entries()).map(([symbol, stats]) => ({
    symbol: symbol.replace('/USDT', 'USDT'),
    pnl: stats.pnl,
    trades: stats.trades,
    winRate: (stats.wins / stats.trades) * 100,
  }));
  
  // Sort by absolute P&L value (descending)
  assets.sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl));
  
  // Take top 5
  return assets.slice(0, 5);
});

// Find max absolute value for scaling bars
const maxAbsPnl = computed(() => {
  if (assetHeatData.value.length === 0) return 1;
  return Math.max(...assetHeatData.value.map(a => Math.abs(a.pnl)), 1);
});

function getBarWidth(pnl: number): string {
  const percentage = (Math.abs(pnl) / maxAbsPnl.value) * 100;
  return `${Math.max(percentage, 5)}%`; // Minimum 5% width for visibility
}

function formatPnl(pnl: number): string {
  const sign = pnl >= 0 ? '+' : '';
  return `${sign}${pnl.toFixed(0)}%`;
}
</script>

<template>
  <div class="glass-panel rounded-xl p-5">
    <div class="flex items-center justify-between mb-5">
      <h3 class="text-lg font-semibold text-white flex items-center gap-2">
        <FireIcon class="w-5 h-5 text-orange-400" />
        Разбивка // ASSET HEAT
      </h3>
      <span class="text-sm text-slate-400">По активам</span>
    </div>
    
    <div class="space-y-4">
      <div 
        v-for="asset in assetHeatData" 
        :key="asset.symbol"
        class="group"
      >
        <!-- Symbol and PnL Row -->
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-sm font-medium text-white tracking-wide">
            {{ asset.symbol }}
          </span>
          <span 
            class="text-sm font-semibold"
            :class="asset.pnl >= 0 ? 'text-cyan-400' : 'text-red-400'"
          >
            {{ formatPnl(asset.pnl) }}
          </span>
        </div>
        
        <!-- Progress Bar -->
        <div class="h-2 bg-slate-800/80 rounded-full overflow-hidden">
          <div 
            class="h-full rounded-full transition-all duration-500 ease-out relative"
            :class="asset.pnl >= 0 
              ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500' 
              : 'bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400'"
            :style="{ width: getBarWidth(asset.pnl) }"
          >
            <!-- Glow effect -->
            <div 
              class="absolute inset-0 rounded-full opacity-50 blur-sm"
              :class="asset.pnl >= 0 
                ? 'bg-gradient-to-r from-cyan-300 to-purple-400' 
                : 'bg-gradient-to-r from-red-400 to-orange-300'"
            ></div>
          </div>
        </div>
      </div>
      
      <!-- Empty state -->
      <div v-if="assetHeatData.length === 0" class="text-center py-6 text-slate-500">
        <p class="text-sm">Нет данных по активам</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom gradient glow effect */
.group:hover .h-2 > div {
  filter: brightness(1.2);
}
</style>
