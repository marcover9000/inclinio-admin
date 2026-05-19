<script setup lang="ts">
/*
 * Dashboard de cartera (global, no user-scoped). Fase 3d.
 * KPIs (instantània, no depenen del filtre) + donut hores/projecte +
 * barra facturable/intern (els 2 gràfics respecten el rang de dates).
 */
import { computed, onMounted, ref, watch } from 'vue';
import AppShell from '@/shared/components/AppShell.vue';
import PageHeader from '@/shared/components/ui/PageHeader.vue';
import Card from '@/shared/components/ui/Card.vue';
import FilterBar from '@/shared/components/ui/FilterBar.vue';
import ToggleChip from '@/shared/components/ui/ToggleChip.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import DateField from '@/shared/components/form/DateField.vue';
import DonutChart from '@/shared/components/ui/DonutChart.vue';
import { useAsyncAction } from '@/shared/composables/useAsyncAction';
import { getDashboardTime } from '@/modules/projects/api/projects';
import type { DashboardTime } from '@/modules/projects/types';

const { run, loading, errorMsg } = useAsyncAction();
const data = ref<DashboardTime | null>(null);

const filterFrom = ref('');
const filterTo = ref('');
const allDates = ref(true);

// Triar una data implica voler el rang aplicat: a 3c les dates sempre
// compten; aquí el default és "totes les dates", així que l'acció de
// l'usuari de triar-ne una l'activa (camps sempre interactius, com a 3c).
watch([filterFrom, filterTo], ([f, t]) => {
  if (f || t) allDates.value = false;
});

function toggleAllDates(): void {
  allDates.value = !allDates.value;
  if (allDates.value) {
    filterFrom.value = '';
    filterTo.value = '';
  }
}

async function load() {
  await run(async () => {
    const params: { from?: string; to?: string } = {};
    if (!allDates.value) {
      if (filterFrom.value) params.from = filterFrom.value;
      if (filterTo.value) params.to = filterTo.value;
    }
    data.value = await getDashboardTime(params);
  }, 'No s\'ha pogut carregar el dashboard.');
}
watch([filterFrom, filterTo, allDates], load);
onMounted(load);

const PALETTE = [
  'text-brand-600', 'text-accent-600', 'text-success-600', 'text-warning-800',
  'text-danger-500', 'text-brand-800', 'text-accent-800', 'text-neutral-500',
];

const donutSegments = computed(() =>
  (data.value?.hours_by_project ?? []).map((p, i) => ({
    label: p.project_name,
    value: p.hours,
    colorClass: p.project_id === 0 ? 'text-neutral-500' : (PALETTE[i % PALETTE.length] ?? 'text-neutral-500'),
  })),
);

const split = computed(() => data.value?.billable_split ?? { billable_hours: 0, internal_hours: 0 });
const splitTotal = computed(() => split.value.billable_hours + split.value.internal_hours);
function pct(v: number): number { return splitTotal.value > 0 ? Math.round((v / splitTotal.value) * 100) : 0; }
function hLabel(h: number): string { return `${h.toLocaleString('ca-ES')} h`; }
</script>

<template>
  <AppShell>
    <PageHeader title="Dashboard" subtitle="Visió global de la cartera" />

    <AlertMessage v-if="errorMsg" variant="error" :message="errorMsg" />

    <FilterBar>
      <DateField v-model="filterFrom" label="Des de" class="w-44" />
      <DateField v-model="filterTo" label="Fins a" class="w-44" />
      <ToggleChip :active="allDates" @toggle="toggleAllDates">Totes les dates</ToggleChip>
    </FilterBar>

    <Card title="Resum">
      <p class="text-xs text-neutral-500">
        Cost teòric i marge real són totals de cartera (no depenen del filtre de dates).
      </p>
      <div class="mt-3 grid grid-cols-2 gap-4 md:grid-cols-5">
        <div class="rounded border border-neutral-200 p-4">
          <p class="text-xs text-neutral-500">Hores avui</p>
          <p class="text-lg font-semibold">{{ hLabel(data?.kpis.hours_today ?? 0) }}</p>
        </div>
        <div class="rounded border border-neutral-200 p-4">
          <p class="text-xs text-neutral-500">Hores setmana</p>
          <p class="text-lg font-semibold">{{ hLabel(data?.kpis.hours_week ?? 0) }}</p>
        </div>
        <div class="rounded border border-neutral-200 p-4">
          <p class="text-xs text-neutral-500">Hores mes</p>
          <p class="text-lg font-semibold">{{ hLabel(data?.kpis.hours_month ?? 0) }}</p>
        </div>
        <div class="rounded border border-neutral-200 p-4">
          <p class="text-xs text-neutral-500">Cost teòric</p>
          <p class="text-lg font-semibold">{{ data?.kpis.theoretical_cost.formatted ?? '—' }}</p>
        </div>
        <div class="rounded border border-neutral-200 p-4">
          <p class="text-xs text-neutral-500">Marge real</p>
          <p class="text-lg font-semibold">{{ data?.kpis.real_margin.formatted ?? '—' }}</p>
        </div>
      </div>
    </Card>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card title="Hores per projecte">
        <p v-if="loading" class="text-sm text-neutral-500">Carregant…</p>
        <p v-else-if="!donutSegments.length" class="text-sm text-neutral-500">Encara no hi ha imputacions.</p>
        <DonutChart v-else :segments="donutSegments" />
      </Card>

      <Card title="Facturable vs intern">
        <p v-if="loading" class="text-sm text-neutral-500">Carregant…</p>
        <p v-else-if="splitTotal === 0" class="text-sm text-neutral-500">Encara no hi ha imputacions.</p>
        <div v-else class="space-y-3">
          <div class="flex h-6 w-full overflow-hidden rounded">
            <div class="bg-brand-600" :style="{ width: pct(split.billable_hours) + '%' }" />
            <div class="bg-neutral-500" :style="{ width: pct(split.internal_hours) + '%' }" />
          </div>
          <ul class="space-y-1 text-sm">
            <li class="flex items-center justify-between">
              <span class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 rounded-full bg-brand-600" />Facturable
              </span>
              <span class="tabular-nums text-neutral-600">{{ hLabel(split.billable_hours) }} · {{ pct(split.billable_hours) }}%</span>
            </li>
            <li class="flex items-center justify-between">
              <span class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 rounded-full bg-neutral-500" />Intern
              </span>
              <span class="tabular-nums text-neutral-600">{{ hLabel(split.internal_hours) }} · {{ pct(split.internal_hours) }}%</span>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  </AppShell>
</template>
