<script setup lang="ts">
import { BeakerIcon } from '@heroicons/vue/24/outline';

interface Props {
  message: string;
}

defineProps<Props>();
</script>

<template>
  <div class="glass-panel rounded-xl p-4 border border-amber-400/30 bg-amber-500/10">
    <div class="flex items-center gap-2 text-amber-300 text-sm font-medium">
      <BeakerIcon class="w-5 h-5" />
      <span>{{ message }}</span>
    </div>
  </div>
</template>
