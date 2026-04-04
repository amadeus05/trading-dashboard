import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import Dashboard from '../components/Dashboard.vue';
import Health from '../views/Health.vue';
import NotFound from '../views/NotFound.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: 'Paper Trading Dashboard',
    },
  },
  {
    path: '/health',
    name: 'Health',
    component: Health,
    meta: {
      title: 'System Health - Paper Trading',
    },
  },
  // Catch all 404 route - must be last
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '404 - Страница не найдена',
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    // Always scroll to top when navigating
    return { top: 0 };
  },
});

// Update document title on route change
router.beforeEach((to) => {
  const title = to.meta.title as string;
  if (title) {
    document.title = title;
  }
});

export default router;
