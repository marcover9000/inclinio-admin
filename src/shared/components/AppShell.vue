<script setup lang="ts">
/*
 * Layout per a rutes autenticades. Header amb branding + botó logout.
 * El contingut de la ruta es renderitza al <slot />.
 */
import { useAuthStore } from '@/shared/stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

async function handleLogout() {
  await auth.logout();
  router.push('/login');
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <header class="bg-white border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div>
          <span class="text-lg font-semibold text-slate-800">Inclinio v2</span>
          <span class="ml-2 text-sm text-slate-500">Panell d'administració</span>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-slate-600">{{ auth.user?.name }}</span>
          <button
            type="button"
            class="text-sm text-slate-600 hover:text-slate-800 underline"
            @click="handleLogout"
          >
            Sortir
          </button>
        </div>
      </div>
    </header>
    <main class="flex-1 max-w-7xl mx-auto w-full p-4">
      <slot />
    </main>
  </div>
</template>
