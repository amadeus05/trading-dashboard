<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { FunnelIcon, CalendarIcon, CurrencyDollarIcon, ArrowPathIcon, CheckIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/vue/24/outline';
import type { Filters, FilterState } from '../types';

interface Props {
  filters: Filters;
  modelValue: FilterState;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: FilterState];
  'apply': [];
  'reset': [];
  'interaction': [];
}>();

// Emit interaction event for auto-refresh pause
function emitInteraction() {
  emit('interaction');
}

// Local state for dropdowns
const showSymbolsDropdown = ref(false);
const showExitReasonsDropdown = ref(false);

// Available options
const availableSymbols = computed(() => props.filters.all_symbols || []);
const availableExitReasons = computed(() => props.filters.all_exit_reasons || []);

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return props.modelValue.dateFrom || 
         props.modelValue.dateTo || 
         props.modelValue.selectedSymbols.length > 0 || 
         props.modelValue.direction || 
         props.modelValue.selectedExitReasons.length > 0;
});

// Active filters display
const activeFilters = computed(() => {
  const filters: Array<{ label: string; value: string }> = [];
  if (props.modelValue.dateFrom) filters.push({ label: 'От:', value: props.modelValue.dateFrom });
  if (props.modelValue.dateTo) filters.push({ label: 'До:', value: props.modelValue.dateTo });
  if (props.modelValue.selectedSymbols.length > 0) {
    filters.push({ label: 'Монеты:', value: `${props.modelValue.selectedSymbols.length}` });
  }
  if (props.modelValue.direction) filters.push({ label: '', value: props.modelValue.direction.toUpperCase() });
  if (props.modelValue.selectedExitReasons.length > 0) {
    filters.push({ label: 'Выход:', value: props.modelValue.selectedExitReasons.join(', ') });
  }
  return filters;
});

// Toggle dropdowns
function toggleSymbolsDropdown() {
  showSymbolsDropdown.value = !showSymbolsDropdown.value;
  showExitReasonsDropdown.value = false;
}

function toggleExitReasonsDropdown() {
  showExitReasonsDropdown.value = !showExitReasonsDropdown.value;
  showSymbolsDropdown.value = false;
}

// Toggle symbol selection
function toggleSymbol(symbol: string) {
  emitInteraction();
  const current = [...props.modelValue.selectedSymbols];
  const index = current.indexOf(symbol);
  if (index > -1) {
    current.splice(index, 1);
  } else {
    current.push(symbol);
  }
  emit('update:modelValue', { ...props.modelValue, selectedSymbols: current });
}

// Toggle exit reason selection
function toggleExitReason(reason: string) {
  emitInteraction();
  const current = [...props.modelValue.selectedExitReasons];
  const index = current.indexOf(reason);
  if (index > -1) {
    current.splice(index, 1);
  } else {
    current.push(reason);
  }
  emit('update:modelValue', { ...props.modelValue, selectedExitReasons: current });
}

// Remove chip
function removeSymbol(symbol: string) {
  toggleSymbol(symbol);
}

function removeExitReason(reason: string) {
  toggleExitReason(reason);
}

// Update date fields
function updateDateFrom(value: string) {
  emitInteraction();
  emit('update:modelValue', { ...props.modelValue, dateFrom: value });
}

function updateDateTo(value: string) {
  emitInteraction();
  emit('update:modelValue', { ...props.modelValue, dateTo: value });
}

function updateDirection(value: string) {
  emitInteraction();
  emit('update:modelValue', { ...props.modelValue, direction: value });
}

// Close dropdowns on click outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.multi-select-container')) {
    showSymbolsDropdown.value = false;
    showExitReasonsDropdown.value = false;
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});

// Reset function
function resetFilters() {
  emit('reset');
}

// Apply function
function applyFilters() {
  emit('apply');
}

// Display helpers
const visibleSymbols = computed(() => props.modelValue.selectedSymbols.slice(0, 3));
const hiddenSymbolsCount = computed(() => Math.max(0, props.modelValue.selectedSymbols.length - 3));
const visibleExitReasons = computed(() => props.modelValue.selectedExitReasons.slice(0, 2));
const hiddenExitReasonsCount = computed(() => Math.max(0, props.modelValue.selectedExitReasons.length - 2));
</script>

<template>
  <div class="glass-panel rounded-xl p-5 mb-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-white flex items-center gap-2">
        <FunnelIcon class="w-5 h-5 text-indigo-400" />
        Фильтры
      </h3>
      <div class="flex gap-2">
        <button 
          v-if="hasActiveFilters"
          @click="resetFilters"
          class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors flex items-center gap-1"
        >
          <XMarkIcon class="w-4 h-4" />
          Сбросить
        </button>
        <button 
          @click="applyFilters"
          class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
        >
          <CheckIcon class="w-4 h-4" />
          Применить
        </button>
      </div>
    </div>

    <!-- Filter Form -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <!-- Date From -->
      <div>
        <label class="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1.5">
          <CalendarIcon class="w-3 h-3 text-indigo-400" />
          Дата от
        </label>
        <input 
          type="date" 
          :value="modelValue.dateFrom"
          @input="(e) => updateDateFrom((e.target as HTMLInputElement).value)"
          class="w-full px-3 py-2.5 custom-input"
        >
      </div>

      <!-- Date To -->
      <div>
        <label class="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1.5">
          <CalendarIcon class="w-3 h-3 text-indigo-400" />
          Дата до
        </label>
        <input 
          type="date" 
          :value="modelValue.dateTo"
          @input="(e) => updateDateTo((e.target as HTMLInputElement).value)"
          class="w-full px-3 py-2.5 custom-input"
        >
      </div>

      <!-- Symbols Multi-Select -->
      <div>
        <label class="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1.5">
          <CurrencyDollarIcon class="w-3 h-3 text-indigo-400" />
          Монеты
        </label>
        <div class="multi-select-container relative">
          <div 
            @click="toggleSymbolsDropdown"
            :class="['multi-select-trigger', { active: showSymbolsDropdown }]"
          >
            <div class="selected-chips">
              <template v-if="modelValue.selectedSymbols.length === 0">
                <span class="text-slate-500">Все монеты</span>
              </template>
              <template v-else>
                <span 
                  v-for="sym in visibleSymbols" 
                  :key="sym"
                  class="selected-chip"
                >
                  {{ sym }}
                  <span 
                    @click.stop="removeSymbol(sym)"
                    class="remove hover:text-white"
                  >×</span>
                </span>
                <span v-if="hiddenSymbolsCount > 0" class="selected-chip selected-chip-summary">
                  +{{ hiddenSymbolsCount }} еще
                </span>
              </template>
            </div>
            <ChevronDownIcon 
              class="w-4 h-4 text-indigo-400 transition-transform flex-shrink-0"
              :class="{ 'rotate-180': showSymbolsDropdown }"
            />
          </div>
          <div 
            :class="['multi-select-dropdown', { open: showSymbolsDropdown }]"
            style="z-index: 100;"
          >
            <div 
              v-for="sym in availableSymbols" 
              :key="sym"
              :class="['multi-select-option', { selected: modelValue.selectedSymbols.includes(sym) }]"
              @click="toggleSymbol(sym)"
            >
              <input 
                type="checkbox" 
                :checked="modelValue.selectedSymbols.includes(sym)"
                @click.stop
                @change.stop="toggleSymbol(sym)"
                class="accent-indigo-500 cursor-pointer"
              >
              <span>{{ sym }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Direction -->
      <div>
        <label class="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1.5">
          <ArrowPathIcon class="w-3 h-3 text-indigo-400" />
          Направление
        </label>
        <select 
          :value="modelValue.direction"
          @change="(e) => updateDirection((e.target as HTMLSelectElement).value)"
          class="w-full px-3 py-2.5 custom-input custom-select"
        >
          <option value="">Все направления</option>
          <option value="long">🟢 LONG</option>
          <option value="short">🔴 SHORT</option>
        </select>
      </div>

      <!-- Exit Reasons Multi-Select -->
      <div>
        <label class="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1.5">
          <ArrowPathIcon class="w-3 h-3 text-indigo-400 transform rotate-90" />
          Причина выхода
        </label>
        <div class="multi-select-container relative">
          <div 
            @click="toggleExitReasonsDropdown"
            :class="['multi-select-trigger', { active: showExitReasonsDropdown }]"
          >
            <div class="selected-chips">
              <template v-if="modelValue.selectedExitReasons.length === 0">
                <span class="text-slate-500">Все причины</span>
              </template>
              <template v-else>
                <span 
                  v-for="reason in visibleExitReasons" 
                  :key="reason"
                  class="selected-chip"
                >
                  {{ reason }}
                  <span 
                    @click.stop="removeExitReason(reason)"
                    class="remove hover:text-white"
                  >×</span>
                </span>
                <span v-if="hiddenExitReasonsCount > 0" class="selected-chip selected-chip-summary">
                  +{{ hiddenExitReasonsCount }} еще
                </span>
              </template>
            </div>
            <ChevronDownIcon 
              class="w-4 h-4 text-indigo-400 transition-transform flex-shrink-0"
              :class="{ 'rotate-180': showExitReasonsDropdown }"
            />
          </div>
          <div 
            :class="['multi-select-dropdown', { open: showExitReasonsDropdown }]"
            style="z-index: 100;"
          >
            <div 
              v-for="reason in availableExitReasons" 
              :key="reason"
              :class="['multi-select-option', { selected: modelValue.selectedExitReasons.includes(reason) }]"
              @click="toggleExitReason(reason)"
            >
              <input 
                type="checkbox" 
                :checked="modelValue.selectedExitReasons.includes(reason)"
                @click.stop
                @change.stop="toggleExitReason(reason)"
                class="accent-indigo-500 cursor-pointer"
              >
              <span>{{ reason }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Filters Display -->
    <div v-if="hasActiveFilters" class="mt-4 pt-4 border-t border-slate-700/50">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-xs text-slate-400">Активные фильтры:</span>
        <span 
          v-for="(filter, idx) in activeFilters" 
          :key="idx"
          class="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-xs"
        >
          <template v-if="filter.label">{{ filter.label }}</template>
          {{ filter.value }}
        </span>
      </div>
    </div>
  </div>
</template>
