/*
 * Router del panell admin amb guards globals.
 *
 * Convencions de meta:
 * - `requiresAuth: true` → redirige a /login si no autenticat.
 * - `guestOnly: true` → redirige a /dashboard si autenticat.
 *
 * Bootstrap: a la primera navegació, el guard crida authStore.bootstrap()
 * que fa un fetchUser() silenciós per saber si l'usuari ja té sessió.
 */
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/shared/stores/auth';
import LoginPage from '@/modules/identity/pages/LoginPage.vue';
import PasswordEmailPage from '@/modules/identity/pages/PasswordEmailPage.vue';
import PasswordResetPage from '@/modules/identity/pages/PasswordResetPage.vue';
import DashboardPage from '@/modules/identity/pages/DashboardPage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    component: LoginPage,
    meta: { guestOnly: true },
  },
  {
    path: '/password/email',
    component: PasswordEmailPage,
    meta: { guestOnly: true },
  },
  {
    path: '/password/reset/:token',
    component: PasswordResetPage,
    meta: { guestOnly: true },
  },
  {
    path: '/dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/people',
    component: () => import('@/modules/contacts/pages/PeopleListPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/people/:id',
    component: () => import('@/modules/contacts/pages/PersonDetailPage.vue'),
    meta: { requiresAuth: true },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (!auth.hasFetchedOnce) {
    await auth.bootstrap();
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { path: '/dashboard' };
  }
});
