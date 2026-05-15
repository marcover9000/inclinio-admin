<script setup lang="ts">
/*
 * Layout per a rutes autenticades. Header amb branding + botó logout.
 * El contingut de la ruta es renderitza al <slot />.
 */
import { computed } from 'vue';
import { useAuthStore } from '@/shared/stores/auth';
import { useViewport } from '@/shared/composables/useViewport';
import { RouterLink, useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const { isMobile } = useViewport();

/*
 * Nav declarativa. `mobile: false` = secció no consultable des de mòbil
 * (p.ex. Dashboard, i futures vistes tècniques/config). Afegir-hi
 * "Projectes" o seccions noves és només una línia més en aquest array.
 */
const navItems = [
  { to: '/dashboard', label: 'Dashboard', mobile: false },
  { to: '/leads', label: 'Leads', mobile: true },
  { to: '/people', label: 'Persones', mobile: true },
  { to: '/companies', label: 'Empreses', mobile: true },
];

const visibleNavItems = computed(() =>
  isMobile.value ? navItems.filter((item) => item.mobile) : navItems,
);

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
          <RouterLink
            v-for="item in visibleNavItems"
            :key="item.to"
            :to="item.to"
            class="text-sm font-medium hover:text-brand-600"
          >
            {{ item.label }}
          </RouterLink>
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
