/*
 * Store global d'autenticació. Mantingut sincronitzat amb la sessió cookie del backend.
 * - bootstrap() es crida una sola vegada des del router (al primer beforeEach).
 * - login(), logout() es cridan des de les pàgines.
 * - fetchUser() permet refrescar l'estat sota demanda.
 */
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import * as authApi from '@/modules/identity/api/auth';
import type { User } from '@/shared/types/User';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const hasFetchedOnce = ref(false);

  const isAuthenticated = computed(() => user.value !== null);

  function hasRole(role: 'admin' | 'staff'): boolean {
    return user.value?.role === role;
  }

  /**
   * Crida fetchUser una sola vegada al bootstrap de l'app.
   * Marca hasFetchedOnce per evitar refrescos innecessaris.
   */
  async function bootstrap(): Promise<void> {
    if (hasFetchedOnce.value) return;
    await fetchUser();
    hasFetchedOnce.value = true;
  }

  async function fetchUser(): Promise<void> {
    isLoading.value = true;
    try {
      user.value = await authApi.fetchCurrentUser();
    } finally {
      isLoading.value = false;
    }
  }

  async function login(credentials: authApi.LoginCredentials): Promise<void> {
    user.value = await authApi.login(credentials);
  }

  async function logout(): Promise<void> {
    await authApi.logout();
    user.value = null;
  }

  return {
    user,
    isLoading,
    hasFetchedOnce,
    isAuthenticated,
    hasRole,
    bootstrap,
    fetchUser,
    login,
    logout,
  };
});
