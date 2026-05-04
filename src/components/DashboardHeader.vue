<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { 
  ArrowPathIcon, 
  BuildingLibraryIcon, 
  ClockIcon, 
  ScaleIcon, 
  ChartBarIcon, 
  BeakerIcon, 
  ServerIcon,
  PauseIcon,
  PlayIcon
} from '@heroicons/vue/24/outline';
import { isDemoMode } from '../services/mockData';

interface Props {
  appTitle?: string;
  botName?: string;
  modeLabel?: string;
  exchange: string;
  timeframe: string;
  htfTimeframe: string;
  leverage: number;
  onRefresh: () => void;
  isAutoRefreshEnabled?: boolean;
  isAutoRefreshPaused?: boolean;
  countdown?: string;
  progressPercent?: number;
}

withDefaults(defineProps<Props>(), {
  appTitle: 'Trading Bot Dashboard',
  botName: 'Trading Bot',
  modeLabel: '',
  isAutoRefreshEnabled: false,
  isAutoRefreshPaused: false,
  countdown: '',
  progressPercent: 100,
});

const emit = defineEmits<{
  pause: [];
  resume: [];
}>();

const demoMode = isDemoMode();

// Session uptime counter
const sessionUptime = ref('00:00:00');
let intervalId: number | null = null;
let startTime = Date.now();

function formatUptime(ms: number): string {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function updateUptime() {
  const elapsed = Date.now() - startTime;
  sessionUptime.value = formatUptime(elapsed);
}

function handlePause() {
  emit('pause');
}

function handleResume() {
  emit('resume');
}

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
  <header class="glass-panel sticky top-0 z-50 border-b border-slate-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo & Title -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <ChartBarIcon class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-white">{{ appTitle }}</h1>
            <p class="text-xs text-slate-400">
              {{ demoMode ? `${botName} - Demo Data` : `${botName}${modeLabel ? ` - ${modeLabel}` : ''}` }}
            </p>
          </div>
        </div>

        <!-- Info Badges -->
        <div class="flex items-center gap-4 text-sm">
          <!-- Demo Mode Badge -->
          <div 
            v-if="demoMode"
            class="px-3 py-1.5 bg-amber-500/20 rounded-lg border border-amber-500/50 flex items-center gap-2"
            title="Демо-режим активен - используются фейковые данные"
          >
            <BeakerIcon class="w-4 h-4 text-amber-400" />
            <span class="text-amber-300 font-medium">DEMO</span>
          </div>
          
          <!-- Session Uptime -->
          <div 
            class="hidden sm:flex px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 items-center gap-2"
            title="Время работы сессии"
          >
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <ServerIcon class="w-4 h-4 text-emerald-400" />
            <span class="text-emerald-400 font-mono">{{ sessionUptime }}</span>
          </div>
          
          <!-- Auto-refresh indicator -->
          <div 
            v-if="isAutoRefreshEnabled && countdown"
            class="hidden md:flex flex-col items-center px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 min-w-[90px]"
            title="Авто-обновление данных"
          >
            <div class="flex items-center gap-2">
              <ClockIcon class="w-4 h-4 text-indigo-400" />
              <span class="text-indigo-400 font-mono text-xs">{{ countdown }}</span>
            </div>
            <!-- Progress bar -->
            <div class="w-full h-1 bg-slate-700 rounded-full mt-1.5 overflow-hidden">
              <div 
                class="h-full bg-indigo-500 transition-all duration-1000 ease-linear"
                :style="{ width: `${progressPercent || 100}%` }"
              ></div>
            </div>
          </div>

          <button
            v-if="isAutoRefreshEnabled"
            @click="isAutoRefreshPaused ? handleResume() : handlePause()"
            class="hidden md:flex px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors items-center gap-1"
            :title="isAutoRefreshPaused ? 'Resume auto-refresh' : 'Pause auto-refresh'"
          >
            <PlayIcon v-if="isAutoRefreshPaused" class="w-4 h-4 text-emerald-400" />
            <PauseIcon v-else class="w-4 h-4 text-amber-400" />
            <span>{{ isAutoRefreshPaused ? 'Resume' : 'Pause' }}</span>
          </button>
          
          <div class="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
            <BuildingLibraryIcon class="w-4 h-4 text-indigo-400 inline mr-2" />
            <span class="text-slate-300">{{ exchange }}</span>
          </div>
          <div class="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
            <ClockIcon class="w-4 h-4 text-indigo-400 inline mr-2" />
            <span class="text-slate-300">{{ timeframe }} / {{ htfTimeframe }}</span>
          </div>
          <div class="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
            <ScaleIcon class="w-4 h-4 text-indigo-400 inline mr-2" />
            <span class="text-slate-300">{{ leverage }}x</span>
          </div>
          <button 
            @click="onRefresh"
            :disabled="demoMode"
            class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon class="w-4 h-4" />
            <span>Обновить</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
