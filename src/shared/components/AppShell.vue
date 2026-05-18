<script setup lang="ts">
/*
 * Layout per a rutes autenticades. Orquestrador de navegació:
 * - desktop (≥1024): sidebar fix lateral
 * - tauleta/mòbil (<1024): barra superior prima + drawer lliscant
 * El contingut del sidebar viu a AppSidebar (renderitzat un sol cop).
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/shared/stores/auth';
import { useViewport } from '@/shared/composables/useViewport';
import AppSidebar, { type NavItem } from '@/shared/components/AppSidebar.vue';
import AppIcon from '@/shared/components/ui/AppIcon.vue';
import QuickAddTimeEntry from '@/modules/projects/components/QuickAddTimeEntry.vue';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const { isDesktop } = useViewport();

/*
 * Nav declarativa agrupada. `adminOnly: true` = només role === 'admin'.
 * Afegir una secció = una línia més (i, si cal, una icona a AppIcon).
 */
const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/leads', label: 'Leads', icon: 'leads', group: 'CRM' },
  { to: '/people', label: 'Persones', icon: 'persones', group: 'Contactes' },
  { to: '/companies', label: 'Empreses', icon: 'empreses', group: 'Contactes' },
  { to: '/projects', label: 'Projectes', icon: 'projectes', group: 'Projectes' },
  { to: '/my-hours', label: 'Les meves hores', icon: 'hores', group: 'Projectes' },
  { to: '/settings', label: 'Configuració', icon: 'config', group: 'Admin', adminOnly: true },
];

const visibleNavItems = computed(() =>
  navItems.filter((i) => !i.adminOnly || auth.user?.role === 'admin'),
);

const globalQuickOpen = ref(false);
const drawerOpen = ref(false);

function openQuickAdd() {
  globalQuickOpen.value = true;
  drawerOpen.value = false;
}

async function handleLogout() {
  drawerOpen.value = false;
  await auth.logout();
  router.push('/login');
}

// El drawer es tanca en navegar (robust, sense acoblament amb AppSidebar).
watch(() => route.fullPath, () => {
  drawerOpen.value = false;
});

// Esc tanca el drawer (Modal no gestiona Esc → afegit aquí).
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') drawerOpen.value = false;
}
onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
</script>

<template>
  <div class="flex min-h-screen bg-neutral-50">
    <!-- Desktop: sidebar fix -->
    <aside
      v-if="isDesktop"
      class="sticky top-0 h-screen w-60 shrink-0 overflow-y-auto border-r border-neutral-200"
    >
      <AppSidebar
        :nav-items="visibleNavItems"
        :user="auth.user"
        @quick-add="openQuickAdd"
        @logout="handleLogout"
      />
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <!-- Tauleta/mòbil: barra superior prima amb hamburguesa -->
      <header
        v-if="!isDesktop"
        class="flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3"
      >
        <button
          type="button"
          class="text-neutral-600 hover:text-neutral-800"
          aria-label="Obrir menú"
          @click="drawerOpen = true"
        >
          <AppIcon name="menu" class="h-6 w-6" />
        </button>
        <span class="text-lg font-semibold text-neutral-800">Inclinio v2</span>
      </header>

      <!-- Padding i espaiat centralitzats: les pàgines no els repeteixen. -->
      <main class="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
        <slot />
      </main>
    </div>

    <!-- Tauleta/mòbil: drawer (mecànica idèntica a Modal.vue) -->
    <Teleport to="body">
      <div
        v-if="!isDesktop && drawerOpen"
        class="fixed inset-0 z-50"
        role="dialog"
        aria-modal="true"
      >
        <div class="absolute inset-0 bg-black/30" @click="drawerOpen = false"></div>
        <div class="absolute inset-y-0 left-0 w-60 overflow-y-auto border-r border-neutral-200 shadow-xl">
          <AppSidebar
            :nav-items="visibleNavItems"
            :user="auth.user"
            @quick-add="openQuickAdd"
            @logout="handleLogout"
          />
        </div>
      </div>
    </Teleport>

    <QuickAddTimeEntry
      :open="globalQuickOpen"
      :project-id="null"
      :last-entry="null"
      @close="globalQuickOpen = false"
      @saved="globalQuickOpen = false"
    />
  </div>
</template>
