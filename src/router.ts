/*
 * Router del panell admin.
 * Les rutes meta `requiresAuth` o `guestOnly` marquen la política d'accés.
 * El guard global a beforeEach (afegit a Tasca 13) aplica la lògica.
 */
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  // Les pàgines reals s'afegeixen a tasques posteriors.
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
