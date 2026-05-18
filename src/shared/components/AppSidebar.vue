<script lang="ts">
import type { IconName } from '@/shared/components/ui/AppIcon.vue';

export interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  group?: string; // capçalera de grup; undefined = ítem solt (Dashboard)
  adminOnly?: boolean; // gating per role === 'admin' (Configuració)
}
</script>

<script setup lang="ts">
/*
 * Contingut del sidebar (presentacional). Es renderitza una sola vegada
 * i s'usa tant a l'aside fix (desktop) com dins el drawer (!isDesktop).
 * No coneix viewport ni drawer: això viu a AppShell.
 */
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import AppIcon from '@/shared/components/ui/AppIcon.vue';
import Button from '@/shared/components/ui/Button.vue';

const props = defineProps<{
  navItems: NavItem[];
  user: { name?: string | null } | null;
}>();

defineEmits<{ 'quick-add': []; logout: [] }>();

type Row =
  | { kind: 'group'; label: string }
  | { kind: 'item'; item: NavItem }
  | { kind: 'spacer' };

/*
 * Ordre visual: ítems no-Admin amb capçalera quan canvia el grup →
 * spacer (empeny avall) → grup Admin al fons.
 */
const rows = computed<Row[]>(() => {
  const top = props.navItems.filter((i) => i.group !== 'Admin');
  const admin = props.navItems.filter((i) => i.group === 'Admin');
  const out: Row[] = [];
  let lastGroup: string | undefined;
  for (const item of top) {
    if (item.group && item.group !== lastGroup) out.push({ kind: 'group', label: item.group });
    lastGroup = item.group;
    out.push({ kind: 'item', item });
  }
  out.push({ kind: 'spacer' });
  if (admin.length) {
    out.push({ kind: 'group', label: 'Admin' });
    for (const item of admin) out.push({ kind: 'item', item });
  }
  return out;
});
</script>

<template>
  <div class="flex h-full flex-col bg-white p-4">
    <div class="px-2 pb-3">
      <span class="text-lg font-semibold text-neutral-800">Inclinio v2</span>
      <p class="text-xs text-neutral-500">Panell d'administració</p>
    </div>

    <Button variant="primary" block class="mb-4" @click="$emit('quick-add')">+ Imputar</Button>

    <nav class="flex flex-1 flex-col space-y-0.5">
      <template v-for="(row, i) in rows" :key="i">
        <p
          v-if="row.kind === 'group'"
          class="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-neutral-500"
        >
          {{ row.label }}
        </p>
        <div v-else-if="row.kind === 'spacer'" class="flex-1"></div>
        <RouterLink
          v-else
          :to="row.item.to"
          class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
          active-class="bg-brand-50 text-brand-700"
        >
          <AppIcon :name="row.item.icon" class="h-5 w-5" />
          {{ row.item.label }}
        </RouterLink>
      </template>
    </nav>

    <div class="mt-3 border-t border-neutral-200 pt-3">
      <p class="px-3 text-sm text-neutral-600">{{ user?.name }}</p>
      <button
        type="button"
        class="mt-1 px-3 text-sm text-neutral-600 underline hover:text-neutral-800"
        @click="$emit('logout')"
      >
        Sortir
      </button>
    </div>
  </div>
</template>
