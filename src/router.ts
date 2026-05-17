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
    path: '/people/new',
    component: () => import('@/modules/contacts/pages/PersonCreatePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/people/:id',
    component: () => import('@/modules/contacts/pages/PersonDetailPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/companies',
    component: () => import('@/modules/contacts/pages/CompaniesListPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/companies/new',
    component: () => import('@/modules/contacts/pages/CompanyCreatePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/companies/:id',
    component: () => import('@/modules/contacts/pages/CompanyDetailPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/leads',
    component: () => import('@/modules/crm/pages/LeadsListPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/leads/new',
    component: () => import('@/modules/crm/pages/LeadCreatePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/leads/:id',
    component: () => import('@/modules/crm/pages/LeadDetailPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/projects',
    component: () => import('@/modules/projects/pages/ProjectsListPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/projects/new',
    component: () => import('@/modules/projects/pages/ProjectCreatePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/projects/:id',
    component: () => import('@/modules/projects/pages/ProjectDetailPage.vue'),
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
