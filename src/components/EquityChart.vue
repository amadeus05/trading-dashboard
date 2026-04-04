<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { Chart, type ChartData, type ChartOptions, registerables } from 'chart.js';
import type { EquityPoint } from '../types';

Chart.register(...registerables);

interface Props {
  data: EquityPoint[];
  hasActiveFilters: boolean;
  demoMode: boolean;
  initialBalance: number;
}

const props = defineProps<Props>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

const titleText = computed(() => {
  let text = 'Кривая эквити';
  if (props.hasActiveFilters) text += ' (отфильтрованная)';
  if (props.demoMode) text += ' (демо)';
  return text;
});

function createChart() {
  if (!canvasRef.value) return;
  
  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;

  const labels = props.data.map(d => d.time);
  const balances = props.data.map(d => d.balance);

  const chartData: ChartData<'line'> = {
    labels,
    datasets: [{
      label: 'Баланс',
      data: balances,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
    }]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#94a3b8',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: function(context) {
            return 'Balance: $' + context.parsed.y.toFixed(2);
          }
        }
      }
    },
    scales: {
      x: {
        display: false
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: '#64748b',
          callback: function(value) {
            return '$' + Number(value).toFixed(0);
          }
        }
      }
    }
  };

  chart = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: options
  });
}

function updateChart() {
  if (!chart) {
    createChart();
    return;
  }

  chart.data.labels = props.data.map(d => d.time);
  chart.data.datasets[0].data = props.data.map(d => d.balance);
  chart.update('none');
}

onMounted(() => {
  createChart();
});

onUnmounted(() => {
  if (chart) {
    chart.destroy();
    chart = null;
  }
});

watch(() => props.data, () => {
  updateChart();
}, { deep: true });
</script>

<template>
  <div class="glass-panel rounded-xl p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-white">{{ titleText }}</h3>
      <span class="text-xs text-slate-400">Начальный баланс: ${{ initialBalance.toFixed(2) }}</span>
    </div>
    <div class="relative h-[300px]">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>
