<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ChevronLeftIcon, ChevronRightIcon, TableCellsIcon } from '@heroicons/vue/24/outline';
import type { Trade } from '../types';

interface Props {
  trades: Trade[];
  hasActiveFilters: boolean;
  demoMode: boolean;
}

const props = defineProps<Props>();

// Page size options
const PAGE_SIZE_OPTIONS = [10, 50, 100] as const;
type PageSize = typeof PAGE_SIZE_OPTIONS[number];

// Pagination state
const currentPage = ref(1);
const pageSize = ref<PageSize>(10);

// Reset to first page when trades change
watch(() => props.trades, () => {
  currentPage.value = 1;
}, { deep: true });

// Reset to first page when page size changes
watch(pageSize, () => {
  currentPage.value = 1;
});

// Paginated trades
const paginatedTrades = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return props.trades.slice(start, end);
});

// Total pages
const totalPages = computed(() => {
  return Math.ceil(props.trades.length / pageSize.value);
});

// Total items
const totalItems = computed(() => props.trades.length);

// Start and end item numbers for display
const startItem = computed(() => {
  if (props.trades.length === 0) return 0;
  return (currentPage.value - 1) * pageSize.value + 1;
});

const endItem = computed(() => {
  return Math.min(currentPage.value * pageSize.value, props.trades.length);
});

// Navigation
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}

function goToPrevPage() {
  goToPage(currentPage.value - 1);
}

function goToNextPage() {
  goToPage(currentPage.value + 1);
}

function formatPrice(price: number): string {
  if (price < 1) {
    return `$${price.toFixed(6)}`;
  }
  return `$${price.toFixed(2)}`;
}
</script>

<template>
  <div class="glass-panel rounded-xl p-5">
    <!-- Header with title and page size selector -->
    <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
      <h3 class="text-lg font-semibold text-white">
        {{ hasActiveFilters ? 'Отфильтрованные сделки' : 'Последние сделки' }}
        <span v-if="demoMode" class="text-amber-300 text-sm font-medium ml-2">(демо)</span>
      </h3>
      
      <!-- Page size selector -->
      <div class="flex items-center gap-2">
        <TableCellsIcon class="w-4 h-4 text-slate-400" />
        <span class="text-sm text-slate-400">Показать:</span>
        <select 
          v-model="pageSize"
          class="custom-select px-2 py-1 text-sm min-w-[70px]"
        >
          <option v-for="size in PAGE_SIZE_OPTIONS" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
        <span class="text-sm text-slate-400">записей</span>
      </div>
    </div>
    
    <!-- Trades table -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-slate-400 border-b border-slate-700">
            <th class="pb-2 font-medium">Символ</th>
            <th class="pb-2 font-medium">Направление</th>
            <th class="pb-2 font-medium">Вход</th>
            <th class="pb-2 font-medium">Выход</th>
            <th class="pb-2 font-medium">P&L</th>
            <th class="pb-2 font-medium">Причина</th>
            <th class="pb-2 font-medium">Время</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="trade in paginatedTrades" 
            :key="`${trade.symbol}-${trade.exit_time}`"
            class="trade-row border-b border-slate-800/50 transition-colors"
          >
            <td class="py-3 font-medium text-slate-200">{{ trade.symbol }}</td>
            <td class="py-3">
              <span 
                class="px-2 py-1 rounded text-xs font-medium"
                :class="trade.direction === 'LONG' 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/20 text-red-400'"
              >
                {{ trade.direction }}
              </span>
            </td>
            <td class="py-3 text-slate-300">{{ formatPrice(trade.entry_price) }}</td>
            <td class="py-3 text-slate-300">{{ formatPrice(trade.exit_price) }}</td>
            <td 
              class="py-3 font-semibold"
              :class="trade.is_win ? 'positive' : 'negative'"
            >
              {{ trade.is_win ? '+' : '' }}${{ trade.pnl.toFixed(2) }}
            </td>
            <td class="py-3 text-slate-400">{{ trade.exit_reason }}</td>
            <td class="py-3 text-slate-400 text-xs">{{ trade.exit_time }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Empty state -->
    <div v-if="trades.length === 0" class="text-center py-8 text-slate-500">
      <p>Нет сделок для отображения</p>
    </div>
    
    <!-- Pagination controls -->
    <div v-if="trades.length > 0" class="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
      <!-- Info text -->
      <div class="text-sm text-slate-400">
        Показано <span class="text-white font-medium">{{ startItem }}-{{ endItem }}</span> 
        из <span class="text-white font-medium">{{ totalItems }}</span> сделок
      </div>
      
      <!-- Navigation buttons -->
      <div class="flex items-center gap-2">
        <!-- Previous button -->
        <button 
          @click="goToPrevPage"
          :disabled="currentPage === 1"
          class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 disabled:text-slate-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1 text-sm"
        >
          <ChevronLeftIcon class="w-4 h-4" />
          <span class="hidden sm:inline">Назад</span>
        </button>
        
        <!-- Page numbers -->
        <div class="flex items-center gap-1">
          <!-- First page -->
          <button 
            v-if="totalPages > 3 && currentPage > 2"
            @click="goToPage(1)"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors"
            :class="currentPage === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
          >
            1
          </button>
          
          <!-- Ellipsis -->
          <span v-if="totalPages > 4 && currentPage > 3" class="text-slate-500 px-1">...</span>
          
          <!-- Pages around current -->
          <button 
            v-for="page in [
              ...Array(Math.min(3, totalPages))
                .fill(0)
                .map((_, i) => {
                  // Show pages around current page
                  let start = currentPage - 1;
                  if (start < 1) start = 1;
                  if (start > totalPages - 2 && totalPages >= 3) start = totalPages - 2;
                  return start + i;
                })
                .filter(p => p > 0 && p <= totalPages)
            ]" 
            :key="page"
            @click="goToPage(page)"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors"
            :class="currentPage === page ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
          >
            {{ page }}
          </button>
          
          <!-- Ellipsis -->
          <span v-if="totalPages > 4 && currentPage < totalPages - 2" class="text-slate-500 px-1">...</span>
          
          <!-- Last page -->
          <button 
            v-if="totalPages > 3 && currentPage < totalPages - 1"
            @click="goToPage(totalPages)"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors"
            :class="currentPage === totalPages ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
          >
            {{ totalPages }}
          </button>
        </div>
        
        <!-- Next button -->
        <button 
          @click="goToNextPage"
          :disabled="currentPage === totalPages"
          class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 disabled:text-slate-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1 text-sm"
        >
          <span class="hidden sm:inline">Вперед</span>
          <ChevronRightIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>
