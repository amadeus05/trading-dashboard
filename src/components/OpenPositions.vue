<script setup lang="ts">
import { BriefcaseIcon } from '@heroicons/vue/24/outline';
import type { OpenPosition } from '../types';

interface Props {
  positions: OpenPosition[];
}

defineProps<Props>();

function formatPrice(price: number): string {
  if (price < 1) {
    return `$${price.toFixed(6)}`;
  }
  return `$${price.toFixed(2)}`;
}
</script>

<template>
  <div class="glass-panel rounded-xl p-5">
    <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
      <BriefcaseIcon class="w-5 h-5 text-indigo-400" />
      Открытые позиции
      <span class="text-sm font-normal text-slate-400">({{ positions.length }})</span>
    </h3>
    
    <div v-if="positions.length > 0" class="space-y-3">
      <div 
        v-for="pos in positions" 
        :key="pos.id"
        class="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-2">
          <span class="font-semibold text-white">{{ pos.symbol }}</span>
          <span 
            class="px-2 py-1 rounded text-xs font-medium"
            :class="pos.direction === 'LONG' 
              ? 'bg-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/20 text-red-400'"
          >
            {{ pos.direction }}
          </span>
        </div>
        
        <!-- Grid Info -->
        <div class="grid grid-cols-2 gap-2 text-xs text-slate-400">
          <div>Вход: <span class="text-slate-200">{{ formatPrice(pos.entry_price) }}</span></div>
          <div>Размер: <span class="text-slate-200">${{ pos.entry_notional.toFixed(2) }}</span></div>
          <div>SL: <span class="text-red-400">{{ pos.stop_pct.toFixed(2) }}%</span></div>
          <div>TP: <span class="text-emerald-400">{{ pos.take_pct.toFixed(2) }}%</span></div>
        </div>
        
        <!-- P-values -->
        <div class="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs">
          <span class="text-slate-500">P(LONG): {{ pos.p_long !== null ? pos.p_long.toFixed(3) : 'n/a' }}</span>
          <span class="text-slate-500">P(SHORT): {{ pos.p_short !== null ? pos.p_short.toFixed(3) : 'n/a' }}</span>
        </div>
        
        <!-- Entry Time -->
        <div class="mt-1 text-xs text-slate-500">{{ pos.entry_time }}</div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else class="text-center py-8 text-slate-500">
      <BriefcaseIcon class="w-12 h-12 mx-auto mb-2 opacity-50" />
      <p>Нет открытых позиций</p>
    </div>
  </div>
</template>
