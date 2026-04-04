<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { DashboardMetrics } from '../types';

interface Props {
  metrics: DashboardMetrics;
  refreshInterval?: number;
  isAutoRefreshEnabled?: boolean;
}

const props = defineProps<Props>();

// Uptime counter
const uptime = ref('00:00:00');
let intervalId: number | null = null;
let startTime = Date.now();

function formatUptime(ms: number): string {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  if (days > 0) {
    return `${days}д ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function updateUptime() {
  const elapsed = Date.now() - startTime;
  uptime.value = formatUptime(elapsed);
}

// Format refresh interval for display
const formattedRefreshInterval = computed(() => {
  const interval = props.refreshInterval || 0;
  if (interval === 0) return 'Отключено';
  if (interval < 60) return `${interval} сек`;
  return `${Math.floor(interval / 60)} мин ${interval % 60 ? (interval % 60) + ' сек' : ''}`;
});

// Status text
const autoRefreshStatus = computed(() => {
  if (!props.isAutoRefreshEnabled) return 'Отключено';
  return 'Активно';
});

onMounted(() => {
  updateUptime();
  intervalId = window.setInterval(updateUptime, 1000);
});

onUnmounted(() => {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
});
</script>

<template>
  <div class="glass-panel rounded-xl p-5">
    <h3 class="text-lg font-semibold text-white mb-4">Информация</h3>
    <div class="space-y-3 text-sm">
      <div class="flex items-center justify-between">
        <span class="text-slate-400">Биржа</span>
        <span class="text-white font-medium">{{ metrics.exchange }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-slate-400">Таймфрейм</span>
        <span class="text-white font-medium">{{ metrics.timeframe }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-slate-400">HTF Таймфрейм</span>
        <span class="text-white font-medium">{{ metrics.htf_timeframe }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-slate-400">Плечо</span>
        <span class="text-white font-medium">{{ metrics.leverage }}x</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-slate-400">Начальный баланс</span>
        <span class="text-white font-medium">${{ metrics.initial_balance.toFixed(2) }}</span>
      </div>
      
      <!-- Uptime with animated dot -->
      <div class="flex items-center justify-between pt-2 border-t border-slate-700/50">
        <span class="text-slate-400 flex items-center gap-2">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Uptime
        </span>
        <span class="text-emerald-400 font-mono font-medium">{{ uptime }}</span>
      </div>
      
      <!-- Auto-refresh info -->
      <div class="flex items-center justify-between pt-2 border-t border-slate-700/50">
        <span class="text-slate-400 flex items-center gap-2">
          <span 
            class="relative flex h-2 w-2"
            :class="isAutoRefreshEnabled ? '' : 'opacity-50'"
          >
            <span 
              v-if="isAutoRefreshEnabled"
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"
            ></span>
            <span 
              class="relative inline-flex rounded-full h-2 w-2"
              :class="isAutoRefreshEnabled ? 'bg-indigo-500' : 'bg-slate-500'"
            ></span>
          </span>
          Авто-обновление
        </span>
        <span 
          class="font-mono font-medium"
          :class="isAutoRefreshEnabled ? 'text-indigo-400' : 'text-slate-500'"
        >
          {{ formattedRefreshInterval }}
        </span>
      </div>
      
      <!-- Status badge -->
      <div class="pt-1">
        <span 
          class="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium"
          :class="isAutoRefreshEnabled 
            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
            : 'bg-slate-700/50 text-slate-500 border border-slate-600/30'"
        >
          <span 
            class="w-1.5 h-1.5 rounded-full"
            :class="isAutoRefreshEnabled ? 'bg-indigo-400' : 'bg-slate-500'"
          ></span>
          {{ autoRefreshStatus }}
        </span>
      </div>
    </div>
  </div>
</template>
