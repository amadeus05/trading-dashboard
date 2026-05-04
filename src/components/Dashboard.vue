<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { dashboardApi } from '../services/api';
import type { DashboardPayload, FilterState } from '../types';
import { isDemoMode } from '../services/mockData';

// Components
import DashboardHeader from './DashboardHeader.vue';
import FilterPanel from './FilterPanel.vue';
import FilteredStatsBanner from './FilteredStatsBanner.vue';
import MetricCards from './MetricCards.vue';
import EquityChart from './EquityChart.vue';
import StatsPanel from './StatsPanel.vue';
import TradesTable from './TradesTable.vue';
import OpenPositions from './OpenPositions.vue';
import QuickInfo from './QuickInfo.vue';
import DemoBanner from './DemoBanner.vue';
import AssetHeat from './AssetHeat.vue';

// State
const loading = ref(true);
const isFetching = ref(false);
const error = ref<string | null>(null);
const dashboardData = ref<DashboardPayload | null>(null);
let latestRequestId = 0;

// Filter state
const filterState = ref<FilterState>({
  dateFrom: '',
  dateTo: '',
  selectedSymbols: [],
  direction: '',
  selectedExitReasons: [],
});

// Auto-refresh configuration
const REFRESH_INTERVAL = Math.max(10, parseInt(import.meta.env.VITE_REFRESH_INTERVAL || '60', 10)); // Min 10 seconds
const isAutoRefreshEnabled = computed(() => REFRESH_INTERVAL > 0 && !isDemoMode());

// Auto-refresh countdown state
const countdown = ref(REFRESH_INTERVAL);
const progressPercent = computed(() => {
  return (countdown.value / REFRESH_INTERVAL) * 100;
});
let refreshTimer: number | null = null;
let countdownTimer: number | null = null;
const isPaused = ref(false);

// Computed
const metrics = computed(() => dashboardData.value?.metrics);
const openPositions = computed(() => dashboardData.value?.open_positions || []);
const recentTrades = computed(() => dashboardData.value?.recent_trades || []);
const equityCurve = computed(() => dashboardData.value?.equity_curve || []);
const filters = computed(() => dashboardData.value?.filters);
const demoMode = computed(() => dashboardData.value?.demo_mode || false);
const demoMessage = computed(() => dashboardData.value?.demo_message || '');
const currentTime = computed(() => dashboardData.value?.current_time || '');
const hasActiveFilters = computed(() => dashboardData.value?.filters?.has_active_filters || false);
const appIdentity = computed(() => dashboardData.value?.app);

// Format countdown for display
const formattedCountdown = computed(() => {
  const minutes = Math.floor(countdown.value / 60);
  const seconds = countdown.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Methods
async function fetchDashboard() {
  if (isFetching.value) return;

  const requestId = ++latestRequestId;
  isFetching.value = true;
  loading.value = !dashboardData.value;
  error.value = null;
  
  try {
    const data = await dashboardApi.getDashboardWithFilters({
      date_from: filterState.value.dateFrom || undefined,
      date_to: filterState.value.dateTo || undefined,
      symbols: filterState.value.selectedSymbols.length > 0 ? filterState.value.selectedSymbols : undefined,
      direction: filterState.value.direction || undefined,
      exit_reasons: filterState.value.selectedExitReasons.length > 0 ? filterState.value.selectedExitReasons : undefined,
    });
    if (requestId !== latestRequestId) return;

    dashboardData.value = data;
    
    // Update filter state from server response
    if (data.filters) {
      filterState.value = {
        dateFrom: data.filters.date_from || '',
        dateTo: data.filters.date_to || '',
        selectedSymbols: data.filters.symbols || [],
        direction: data.filters.direction || '',
        selectedExitReasons: data.filters.exit_reasons || [],
      };
    }
    
    // Reset countdown after successful fetch
    resetCountdown();
  } catch (err) {
    if (requestId === latestRequestId) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
    }
    console.error('Error fetching dashboard:', err);
  } finally {
    if (requestId === latestRequestId) {
      loading.value = false;
      isFetching.value = false;
    }
  }
}

function handleResetFilters() {
  filterState.value = {
    dateFrom: '',
    dateTo: '',
    selectedSymbols: [],
    direction: '',
    selectedExitReasons: [],
  };
  fetchDashboard();
}

// Auto-refresh functions
function resetCountdown() {
  countdown.value = REFRESH_INTERVAL;
}

function startAutoRefresh() {
  if (!isAutoRefreshEnabled.value) return;
  
  // Clear existing timers
  stopAutoRefresh();
  
  // Start countdown timer (updates every second)
  countdownTimer = window.setInterval(() => {
    if (!isPaused.value && countdown.value > 0) {
      countdown.value--;
    }
  }, 1000);
  
  // Start refresh timer
  refreshTimer = window.setInterval(() => {
    if (!isPaused.value) {
      fetchDashboard();
    }
  }, REFRESH_INTERVAL * 1000);
}

function stopAutoRefresh() {
  if (countdownTimer !== null) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  if (refreshTimer !== null) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

function pauseAutoRefresh() {
  isPaused.value = true;
}

function resumeAutoRefresh() {
  isPaused.value = false;
}

// Pause auto-refresh when user is interacting with filters
function onFilterInteraction() {
  pauseAutoRefresh();
}

// Resume when filters are applied
function onFilterApply() {
  resumeAutoRefresh();
  fetchDashboard();
}

// Initial load and auto-refresh setup
onMounted(() => {
  fetchDashboard();
  
  if (isAutoRefreshEnabled.value) {
    startAutoRefresh();
  }
});

onUnmounted(() => {
  stopAutoRefresh();
});

// Watch for demo mode changes and update auto-refresh
watch(() => demoMode.value, (isDemo) => {
  if (isDemo) {
    stopAutoRefresh();
    countdown.value = 0;
  } else if (isAutoRefreshEnabled.value) {
    startAutoRefresh();
  }
});
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-200">
    <!-- Loading State -->
    <div v-if="loading && !dashboardData" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-slate-400">Загрузка дашборда...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center max-w-md p-6 glass-panel rounded-xl">
        <p class="text-red-400 mb-4">Ошибка загрузки: {{ error }}</p>
        <button 
          @click="fetchDashboard"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          Повторить
        </button>
      </div>
    </div>

    <!-- Main Dashboard -->
    <template v-else-if="dashboardData && metrics">
      <!-- Header -->
      <DashboardHeader
        :exchange="metrics.exchange"
        :timeframe="metrics.timeframe"
        :htf-timeframe="metrics.htf_timeframe"
        :leverage="metrics.leverage"
        :on-refresh="fetchDashboard"
        :is-auto-refresh-enabled="isAutoRefreshEnabled"
        :is-auto-refresh-paused="isPaused"
        :countdown="formattedCountdown"
        :progress-percent="progressPercent"
        :app-title="appIdentity?.app_title"
        :bot-name="appIdentity?.bot_name"
        :mode-label="appIdentity?.mode"
        @pause="pauseAutoRefresh"
        @resume="resumeAutoRefresh"
      />

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Filters -->
        <FilterPanel
          v-if="filters"
          v-model="filterState"
          :filters="filters"
          @apply="onFilterApply"
          @reset="handleResetFilters"
          @interaction="onFilterInteraction"
        />

        <!-- Filtered Stats Banner -->
        <FilteredStatsBanner
          v-if="hasActiveFilters"
          :metrics="metrics"
        />

        <!-- Metric Cards -->
        <MetricCards :metrics="metrics" />

        <!-- Main Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column: Stats & Chart -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Demo Banner -->
            <DemoBanner
              v-if="demoMode"
              :message="demoMessage"
            />

            <!-- Equity Chart -->
            <EquityChart
              :data="equityCurve"
              :has-active-filters="hasActiveFilters"
              :demo-mode="demoMode"
              :initial-balance="metrics.initial_balance"
            />

            <!-- Statistics Panel -->
            <StatsPanel :metrics="metrics" />

            <!-- Recent Trades -->
            <TradesTable
              :trades="recentTrades"
              :has-active-filters="hasActiveFilters"
              :demo-mode="demoMode"
            />
          </div>

          <!-- Right Column: Open Positions, Asset Heat & Info -->
          <div class="space-y-6">
            <!-- Open Positions -->
            <OpenPositions :positions="openPositions" />

            <!-- Asset Heat -->
            <AssetHeat :trades="recentTrades" />

            <!-- Quick Info -->
            <QuickInfo 
              :metrics="metrics" 
              :refresh-interval="REFRESH_INTERVAL"
              :is-auto-refresh-enabled="isAutoRefreshEnabled"
            />
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-slate-500 text-sm">
        <p class="flex items-center justify-center gap-2 flex-wrap">
          <span>{{ appIdentity?.app_title || 'Trading Bot Dashboard' }} | Обновлено: {{ currentTime }}</span>
          <span v-if="isAutoRefreshEnabled" class="text-indigo-400">
            | Авто-обновление через {{ formattedCountdown }}
          </span>
          <span v-else-if="demoMode" class="text-amber-400">
            | Демо-режим (без авто-обновления)
          </span>
          <span v-else class="text-slate-600">
            | Авто-обновление отключено
          </span>
        </p>
      </footer>
    </template>
  </div>
</template>
