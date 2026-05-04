<script setup lang="ts">
import { useRouter } from 'vue-router';
import { 
  ExclamationTriangleIcon, 
  HomeIcon, 
  ArrowLeftIcon 
} from '@heroicons/vue/24/outline';

const router = useRouter();
const appTitle = import.meta.env.VITE_APP_TITLE || 'Trading Bot Dashboard';

function goHome() {
  router.push('/');
}

function goBack() {
  router.back();
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4">
    <div class="glass-panel rounded-2xl p-8 max-w-md w-full text-center">
      <!-- 404 Icon -->
      <div class="w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/30">
        <ExclamationTriangleIcon class="w-12 h-12 text-indigo-400" />
      </div>
      
      <!-- Error Code -->
      <h1 class="text-6xl font-bold text-white mb-2 tracking-tight">404</h1>
      
      <!-- Error Title -->
      <h2 class="text-xl font-semibold text-slate-200 mb-4">
        Страница не найдена
      </h2>
      
      <!-- Error Description -->
      <p class="text-slate-400 mb-8 leading-relaxed">
        Страница, которую вы ищете, не существует или была перемещена.
        Проверьте URL или вернитесь на главную страницу.
      </p>
      
      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button 
          @click="goHome"
          class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-white font-medium hover:scale-[1.02] active:scale-[0.98]"
        >
          <HomeIcon class="w-5 h-5" />
          На главную
        </button>
        
        <button 
          @click="goBack"
          class="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-slate-200 font-medium hover:text-white"
        >
          <ArrowLeftIcon class="w-5 h-5" />
          Назад
        </button>
      </div>
      
      <!-- Decorative Elements -->
      <div class="mt-8 pt-6 border-t border-slate-700/50">
        <div class="flex items-center justify-center gap-4 text-xs text-slate-500">
          <span class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            {{ appTitle }}
          </span>
          <span>|</span>
          <span>v1.0.0</span>
        </div>
      </div>
    </div>
    
    <!-- Background decoration -->
    <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
    </div>
  </div>
</template>
