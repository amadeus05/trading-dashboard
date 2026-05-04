<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  HeartIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowPathIcon,
  ServerIcon,
  CircleStackIcon,
  SignalIcon,
  ClockIcon,
  ArrowLeftIcon,
  ShieldCheckIcon
} from '@heroicons/vue/24/outline';
import { dashboardApi } from '../services/api';
import { isDemoMode } from '../services/mockData';
import type { HealthState } from '../types';

const router = useRouter();

// Health check states
const backendStatus = ref<HealthState>('checking');
const dbStatus = ref<HealthState>('checking');
const journalStatus = ref<HealthState>('checking');
const backendMessage = ref('Проверка соединения...');
const dbMessage = ref('Проверка соединения...');
const journalMessage = ref('Проверка журнала событий...');
const lastChecked = ref<string>('');
const responseTime = ref<number>(0);
const isLoading = ref(false);

// System info
const buildTime = ref(new Date().toISOString().slice(0, 19).replace('T', ' '));
const vueVersion = ref('3.5.30');
const appVersion = ref('1.0.0');
const appTitle = ref(import.meta.env.VITE_APP_TITLE || 'Trading Bot Dashboard');
const envMode = ref(import.meta.env.MODE);
const demoMode = ref(isDemoMode());

// Check interval
let checkInterval: number | null = null;
const CHECK_INTERVAL = 30000; // 30 seconds

async function performHealthCheck() {
  if (demoMode.value) {
    // In demo mode, simulate healthy checks
    backendStatus.value = 'healthy';
    dbStatus.value = 'healthy';
    journalStatus.value = 'healthy';
    backendMessage.value = 'Demo mode API stub';
    dbMessage.value = 'Demo mode database stub';
    journalMessage.value = 'Demo mode journal stub';
    responseTime.value = 0;
    lastChecked.value = new Date().toISOString().slice(0, 19).replace('T', ' ');
    return;
  }

  isLoading.value = true;
  const startTime = performance.now();
  
  try {
    const health = await dashboardApi.getHealth();
    
    responseTime.value = health.api.response_time_ms || Math.round(performance.now() - startTime);
    backendStatus.value = health.api.status;
    dbStatus.value = health.database.status;
    journalStatus.value = health.event_journal?.status || 'checking';
    backendMessage.value = health.api.message;
    dbMessage.value = health.database.message;
    journalMessage.value = health.event_journal?.message || 'Event journal status was not reported';
  } catch {
    backendStatus.value = 'unhealthy';
    dbStatus.value = 'unhealthy';
    journalStatus.value = 'unhealthy';
    backendMessage.value = 'Не удалось подключиться к API';
    dbMessage.value = 'Статус базы недоступен из-за ошибки API';
    journalMessage.value = 'Статус журнала недоступен из-за ошибки API';
    responseTime.value = Math.round(performance.now() - startTime);
  } finally {
    lastChecked.value = new Date().toISOString().slice(0, 19).replace('T', ' ');
    isLoading.value = false;
  }
}

function goBack() {
  router.back();
}

function formatStatus(status: string): string {
  const map: Record<string, string> = {
    'healthy': 'Работает',
    'unhealthy': 'Недоступен',
    'checking': 'Проверка...'
  };
  return map[status] || status;
}

function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    'healthy': 'text-emerald-400',
    'unhealthy': 'text-red-400',
    'checking': 'text-amber-400'
  };
  return map[status] || 'text-slate-400';
}

function getStatusBg(status: string): string {
  const map: Record<string, string> = {
    'healthy': 'bg-emerald-500/10 border-emerald-500/30',
    'unhealthy': 'bg-red-500/10 border-red-500/30',
    'checking': 'bg-amber-500/10 border-amber-500/30'
  };
  return map[status] || 'bg-slate-500/10 border-slate-500/30';
}

function getStatusIcon(status: string) {
  if (status === 'healthy') return CheckCircleIcon;
  if (status === 'unhealthy') return XCircleIcon;
  return ArrowPathIcon;
}

// Auto-check on mount and set interval
onMounted(() => {
  performHealthCheck();
  checkInterval = window.setInterval(performHealthCheck, CHECK_INTERVAL);
});

onUnmounted(() => {
  if (checkInterval !== null) {
    clearInterval(checkInterval);
  }
});
</script>

<template>
  <div class="min-h-screen bg-slate-900 flex flex-col">
    <!-- Header -->
    <header class="glass-panel border-b border-slate-700">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <HeartIcon class="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 class="text-xl font-bold text-white">System Health</h1>
              <p class="text-xs text-slate-400">Проверка состояния системы</p>
            </div>
          </div>
          <button 
            @click="goBack"
            class="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-2 text-sm text-slate-200"
          >
            <ArrowLeftIcon class="w-4 h-4" />
            Назад
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <!-- Last Checked Info -->
      <div class="glass-panel rounded-xl p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-sm text-slate-400">
            <ClockIcon class="w-4 h-4" />
            Последняя проверка:
            <span class="text-white font-mono">{{ lastChecked || '—' }}</span>
          </div>
          <div v-if="responseTime > 0" class="flex items-center gap-2 text-sm text-slate-400">
            <SignalIcon class="w-4 h-4" />
            Время отклика:
            <span class="text-emerald-400 font-mono">{{ responseTime }}ms</span>
          </div>
        </div>
        <button 
          @click="performHealthCheck"
          :disabled="isLoading"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2 text-sm text-white"
        >
          <ArrowPathIcon 
            class="w-4 h-4" 
            :class="{ 'animate-spin': isLoading }"
          />
          Проверить сейчас
        </button>
      </div>

      <!-- Status Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <!-- Backend API Status -->
        <div 
          class="glass-panel rounded-xl p-5 border-2 transition-all duration-300"
          :class="getStatusBg(backendStatus)"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div 
                class="w-12 h-12 rounded-xl flex items-center justify-center"
                :class="backendStatus === 'healthy' ? 'bg-emerald-500/20' : backendStatus === 'unhealthy' ? 'bg-red-500/20' : 'bg-amber-500/20'"
              >
                <ServerIcon 
                  class="w-6 h-6"
                  :class="getStatusColor(backendStatus)"
                />
              </div>
              <div>
                <h3 class="font-semibold text-white">Backend API</h3>
                <p class="text-sm" :class="getStatusColor(backendStatus)">
                  {{ formatStatus(backendStatus) }}
                </p>
              </div>
            </div>
            <component 
              :is="getStatusIcon(backendStatus)"
              class="w-6 h-6"
              :class="getStatusColor(backendStatus)"
            />
          </div>
          <div class="mt-4 text-xs text-slate-400">
            <p>{{ backendMessage }}</p>
          </div>
        </div>

        <!-- Database Status -->
        <div 
          class="glass-panel rounded-xl p-5 border-2 transition-all duration-300"
          :class="getStatusBg(dbStatus)"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div 
                class="w-12 h-12 rounded-xl flex items-center justify-center"
                :class="dbStatus === 'healthy' ? 'bg-emerald-500/20' : dbStatus === 'unhealthy' ? 'bg-red-500/20' : 'bg-amber-500/20'"
              >
                <CircleStackIcon 
                  class="w-6 h-6"
                  :class="getStatusColor(dbStatus)"
                />
              </div>
              <div>
                <h3 class="font-semibold text-white">База данных</h3>
                <p class="text-sm" :class="getStatusColor(dbStatus)">
                  {{ formatStatus(dbStatus) }}
                </p>
              </div>
            </div>
            <component 
              :is="getStatusIcon(dbStatus)"
              class="w-6 h-6"
              :class="getStatusColor(dbStatus)"
            />
          </div>
          <div class="mt-4 text-xs text-slate-400">
            <p>{{ dbMessage }}</p>
          </div>
        </div>

        <!-- Event Journal Status -->
        <div 
          class="glass-panel rounded-xl p-5 border-2 transition-all duration-300"
          :class="getStatusBg(journalStatus)"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div 
                class="w-12 h-12 rounded-xl flex items-center justify-center"
                :class="journalStatus === 'healthy' ? 'bg-emerald-500/20' : journalStatus === 'unhealthy' ? 'bg-red-500/20' : 'bg-amber-500/20'"
              >
                <CircleStackIcon 
                  class="w-6 h-6"
                  :class="getStatusColor(journalStatus)"
                />
              </div>
              <div>
                <h3 class="font-semibold text-white">Event Journal</h3>
                <p class="text-sm" :class="getStatusColor(journalStatus)">
                  {{ formatStatus(journalStatus) }}
                </p>
              </div>
            </div>
            <component 
              :is="getStatusIcon(journalStatus)"
              class="w-6 h-6"
              :class="getStatusColor(journalStatus)"
            />
          </div>
          <div class="mt-4 text-xs text-slate-400">
            <p>{{ journalMessage }}</p>
          </div>
        </div>

        <!-- Frontend Status -->
        <div class="glass-panel rounded-xl p-5 border-2 bg-indigo-500/10 border-indigo-500/30">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <ShieldCheckIcon class="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 class="font-semibold text-white">Frontend</h3>
                <p class="text-sm text-indigo-400">Работает</p>
              </div>
            </div>
            <CheckCircleIcon class="w-6 h-6 text-indigo-400" />
          </div>
          <div class="mt-4 text-xs text-slate-400">
            <p>Vue {{ vueVersion }} | Vite | Tailwind CSS</p>
          </div>
        </div>

        <!-- Environment Info -->
        <div class="glass-panel rounded-xl p-5 border-2 bg-purple-500/10 border-purple-500/30">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <SignalIcon class="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 class="font-semibold text-white">Окружение</h3>
                <p class="text-sm text-purple-400">{{ envMode }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span 
                v-if="demoMode"
                class="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs font-medium"
              >
                DEMO
              </span>
              <CheckCircleIcon class="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div class="mt-4 text-xs text-slate-400">
            <p>Режим: {{ demoMode ? 'Демонстрационный' : 'Продакшн' }}</p>
          </div>
        </div>
      </div>

      <!-- Overall Status -->
      <div 
        class="glass-panel rounded-xl p-6 text-center"
        :class="backendStatus === 'healthy' && dbStatus === 'healthy' && journalStatus !== 'unhealthy'
          ? 'bg-emerald-500/5 border border-emerald-500/30' 
          : 'bg-red-500/5 border border-red-500/30'"
      >
        <div class="flex items-center justify-center gap-3 mb-2">
          <component 
            :is="backendStatus === 'healthy' && dbStatus === 'healthy' && journalStatus !== 'unhealthy' ? CheckCircleIcon : XCircleIcon"
            class="w-8 h-8"
            :class="backendStatus === 'healthy' && dbStatus === 'healthy' && journalStatus !== 'unhealthy' ? 'text-emerald-400' : 'text-red-400'"
          />
          <h2 class="text-2xl font-bold text-white">
            {{ backendStatus === 'healthy' && dbStatus === 'healthy' && journalStatus !== 'unhealthy' ? 'Все системы работают' : 'Обнаружены проблемы' }}
          </h2>
        </div>
        <p class="text-slate-400">
          {{ backendStatus === 'healthy' && dbStatus === 'healthy' && journalStatus !== 'unhealthy'
            ? 'Все компоненты системы функционируют нормально.' 
            : 'Некоторые компоненты недоступны. Проверьте соединение.' }}
        </p>
      </div>

      <!-- System Details -->
      <div class="glass-panel rounded-xl p-5 mt-6">
        <h3 class="text-lg font-semibold text-white mb-4">Системная информация</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div class="flex flex-col">
            <span class="text-slate-400 mb-1">Версия приложения</span>
            <span class="text-white font-mono">{{ appVersion }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-slate-400 mb-1">Vue.js</span>
            <span class="text-white font-mono">{{ vueVersion }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-slate-400 mb-1">Время сборки</span>
            <span class="text-white font-mono">{{ buildTime }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-slate-400 mb-1">Режим</span>
            <span class="text-white font-mono">{{ envMode }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-slate-400 mb-1">Демо-режим</span>
            <span class="font-mono" :class="demoMode ? 'text-amber-400' : 'text-slate-400'">
              {{ demoMode ? 'Включен' : 'Отключен' }}
            </span>
          </div>
          <div class="flex flex-col">
            <span class="text-slate-400 mb-1">Интервал проверки</span>
            <span class="text-white font-mono">{{ CHECK_INTERVAL / 1000 }} сек</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="glass-panel border-t border-slate-700">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between text-sm text-slate-500">
          <span>{{ appTitle }}</span>
          <span>v{{ appVersion }}</span>
        </div>
      </div>
    </footer>
  </div>
</template>
