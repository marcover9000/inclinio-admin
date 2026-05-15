<script setup lang="ts">
/*
 * Layout per a rutes autenticades. Header amb branding + botó logout.
 * El contingut de la ruta es renderitza al <slot />.
 */
import { useAuthStore } from '@/shared/stores/auth';
import { RouterLink, useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

async function handleLogout() {
  await auth.logout();
  router.push('/login');
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 flex flex-col">
    <header class="bg-white border-b border-neutral-200">
      <div class="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-6">
        <div>
          <span class="text-lg font-semibold text-neutral-800">Inclinio v2</span>
          <span class="ml-2 text-sm text-neutral-500">Panell d'administració</span>
        </div>
        <nav class="flex items-center gap-4">
          <RouterLink to="/dashboard" class="text-sm font-medium hover:text-brand-600">Dashboard</RouterLink>
          <RouterLink to="/leads" class="text-sm font-medium hover:text-brand-600">Leads</RouterLink>
          <RouterLink to="/people" class="text-sm font-medium hover:text-brand-600">Persones</RouterLink>
          <RouterLink to="/companies" class="text-sm font-medium hover:text-brand-600">Empreses</RouterLink>
        </nav>
        <div class="flex items-center gap-4">
          <span class="text-sm text-neutral-600">{{ auth.user?.name }}</span>
          <button
            type="button"
            class="text-sm text-neutral-600 hover:text-neutral-800 underline"
            @click="handleLogout"
          >
            Sortir
          </button>
        </div>
      </div>
    </header>
    <!-- Padding i espaiat centralitzats: les pàgines no els repeteixen. -->
    <main class="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
      <slot />
    </main>
  </div>
</template>
