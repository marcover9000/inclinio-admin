<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import AppShell from '@/shared/components/AppShell.vue';
import PageHeader from '@/shared/components/ui/PageHeader.vue';
import Card from '@/shared/components/ui/Card.vue';
import Button from '@/shared/components/ui/Button.vue';
import FilterBar from '@/shared/components/ui/FilterBar.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog.vue';
import DateField from '@/shared/components/form/DateField.vue';
import SelectField from '@/shared/components/form/SelectField.vue';
import ToggleChip from '@/shared/components/ui/ToggleChip.vue';
import QuickAddTimeEntry from '../components/QuickAddTimeEntry.vue';
import { useAsyncAction } from '@/shared/composables/useAsyncAction';
import { listMyTimeEntries, deleteTimeEntry } from '../api/projects';
import type { TimeEntry } from '../types';
import { formatDate } from '@/shared/utils/date';

const { run, errorMsg } = useAsyncAction();
const entries = ref<TimeEntry[]>([]);

function iso(d: Date): string { return d.toISOString().slice(0, 10); }
function startOfWeek(d: Date): Date { const x = new Date(d); const day = (x.getDay() + 6) % 7; x.setDate(x.getDate() - day); x.setHours(0,0,0,0); return x; }
function addDays(d: Date, n: number): Date { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function isoWeek(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = (t.getUTCDay() + 6) % 7;
  t.setUTCDate(t.getUTCDate() - day + 3);
  const firstThursday = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  const fday = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - fday + 3);
  return 1 + Math.round((t.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000));
}

const today = new Date();
const weekStart = ref(startOfWeek(today));

const weekDays = computed(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart.value, i)));
const monthStart = computed(() => new Date(today.getFullYear(), today.getMonth(), 1));
const monthEnd = computed(() => new Date(today.getFullYear(), today.getMonth() + 1, 0));

// Filter state — defaults to the visible week; reset on week navigation
const filterFrom = ref(iso(weekStart.value));
const filterTo = ref(iso(addDays(weekStart.value, 6)));
const filterProjectId = ref<number | ''>('');
const filterTaskId = ref<number | ''>('');
const ignoreDates = ref(false);

watch(weekStart, (ws) => {
  filterFrom.value = iso(ws);
  filterTo.value = iso(addDays(ws, 6));
});

// Fetch window: covers month + visible week + filter range
const fetchFrom = computed(() => {
  const candidates = [monthStart.value.getTime(), weekStart.value.getTime(), new Date(filterFrom.value).getTime()];
  return iso(new Date(Math.min(...candidates)));
});
const fetchTo = computed(() => {
  const candidates = [monthEnd.value.getTime(), addDays(weekStart.value, 6).getTime(), new Date(filterTo.value).getTime()];
  return iso(new Date(Math.max(...candidates)));
});

async function load() {
  await run(async () => {
    const params: { from?: string; to?: string; project_id?: number } = {};
    if (!ignoreDates.value) { params.from = fetchFrom.value; params.to = fetchTo.value; }
    if (filterProjectId.value !== '') params.project_id = Number(filterProjectId.value);
    entries.value = await listMyTimeEntries(params);
  }, 'No s\'han pogut carregar les imputacions.');
}
watch([fetchFrom, fetchTo, ignoreDates, filterProjectId], load);
onMounted(load);

function dayEntries(d: Date): TimeEntry[] {
  const k = iso(d);
  return entries.value.filter((e) => e.worked_on === k);
}
function sumMin(list: TimeEntry[]): number { return list.reduce((a, e) => a + e.minutes, 0); }
function fmt(min: number): string { const h = Math.floor(min / 60); const m = min % 60; return m ? `${h} h ${m} min` : `${h} h`; }

const weekTotal = computed(() => fmt(sumMin(weekDays.value.flatMap(dayEntries))));
const weekNumber = computed(() => isoWeek(weekStart.value));
const todayTotal = computed(() => fmt(sumMin(entries.value.filter((e) => e.worked_on === iso(today)))));
const monthTotal = computed(() => fmt(sumMin(entries.value.filter((e) => e.worked_on! >= iso(monthStart.value) && e.worked_on! <= iso(monthEnd.value)))));

// Project and task options derived from loaded entries (distinct by id, stable)
const projectOptions = computed(() => {
  const seen = new Set<number>();
  const opts: { value: number | ''; label: string }[] = [{ value: '', label: '(tots)' }];
  for (const e of entries.value) {
    if (e.project && !seen.has(e.project.id)) {
      seen.add(e.project.id);
      opts.push({ value: e.project.id, label: e.project.name });
    }
  }
  return opts;
});

const taskOptions = computed(() => {
  const seen = new Set<number>();
  const opts: { value: number | ''; label: string }[] = [{ value: '', label: '(totes)' }];
  for (const e of entries.value) {
    if (e.task && !seen.has(e.task.id)) {
      seen.add(e.task.id);
      opts.push({ value: e.task.id, label: e.task.title });
    }
  }
  return opts;
});

const filtered = computed(() => {
  const pid = filterProjectId.value === '' ? null : Number(filterProjectId.value);
  const tid = filterTaskId.value === '' ? null : Number(filterTaskId.value);
  return entries.value
    .filter((e) => ignoreDates.value || (e.worked_on! >= filterFrom.value && e.worked_on! <= filterTo.value))
    .filter((e) => pid === null || e.project_id === pid)
    .filter((e) => tid === null || e.task_id === tid)
    .slice()
    .sort((a, b) => (a.worked_on! < b.worked_on! ? 1 : -1));
});

function exportCsv() {
  const esc = (v: string) => /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  const rows = [['Data', 'Projecte', 'Tasca', 'Minuts', 'Descripció']];
  for (const e of filtered.value) rows.push([formatDate(e.worked_on), e.project?.name ?? '', e.task?.title ?? '', String(e.minutes), e.description ?? '']);
  const csv = rows.map((r) => r.map((c) => esc(c)).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `les-meves-hores_${filterFrom.value}_${filterTo.value}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const quickOpen = ref(false);
const editing = ref<TimeEntry | null>(null);
function openAdd() { editing.value = null; quickOpen.value = true; }
function openEdit(e: TimeEntry) { editing.value = e; quickOpen.value = true; }
const toDelete = ref<TimeEntry | null>(null);
function confirmDelete() {
  const e = toDelete.value!;
  return run(async () => { await deleteTimeEntry(e.project_id, e.id); toDelete.value = null; await load(); }, 'No s\'ha pogut eliminar.');
}

const weekLabel = computed(() => `${formatDate(iso(weekStart.value))} → ${formatDate(iso(addDays(weekStart.value, 6)))}`);
</script>

<template>
  <AppShell>
    <PageHeader title="Les meves hores">
      <template #actions>
        <Button variant="primary" @click="openAdd">+ Imputar hores</Button>
      </template>
    </PageHeader>

    <AlertMessage v-if="errorMsg" variant="error" :message="errorMsg" />

    <Card>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Button variant="secondary" size="sm" @click="weekStart = addDays(weekStart, -7)">‹</Button>
          <span class="text-sm font-medium">{{ weekLabel }}</span>
          <Button variant="secondary" size="sm" @click="weekStart = addDays(weekStart, 7)">›</Button>
        </div>
        <span class="text-sm text-neutral-600">Setmana {{ weekNumber }} · {{ weekTotal }}</span>
      </div>
      <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        <div v-for="d in weekDays" :key="iso(d)" class="rounded border border-neutral-200 p-2">
          <p class="text-xs font-medium text-neutral-500">{{ d.toLocaleDateString('ca-ES', { weekday: 'short', day: 'numeric' }) }}</p>
          <p v-if="!dayEntries(d).length" class="mt-1 text-xs text-neutral-400">—</p>
          <ul v-else class="mt-1 space-y-1">
            <li v-for="e in dayEntries(d)" :key="e.id" class="text-xs text-neutral-700">{{ e.project?.name ?? '—' }} · {{ fmt(e.minutes) }}</li>
          </ul>
          <p class="mt-1 text-xs font-medium text-neutral-600">{{ fmt(sumMin(dayEntries(d))) }}</p>
        </div>
      </div>
    </Card>

    <section class="grid grid-cols-3 gap-4">
      <div class="rounded border border-neutral-200 p-4"><p class="text-xs text-neutral-500">Avui</p><p class="text-lg font-semibold">{{ todayTotal }}</p></div>
      <div class="rounded border border-neutral-200 p-4"><p class="text-xs text-neutral-500">Setmana</p><p class="text-lg font-semibold">{{ weekTotal }}</p></div>
      <div class="rounded border border-neutral-200 p-4"><p class="text-xs text-neutral-500">Mes</p><p class="text-lg font-semibold">{{ monthTotal }}</p></div>
    </section>

    <Card title="Detall">
      <template #actions>
        <Button variant="secondary" size="sm" @click="exportCsv">Exportar CSV</Button>
      </template>
      <FilterBar>
        <DateField v-model="filterFrom" label="Des de" class="w-44" />
        <DateField v-model="filterTo" label="Fins a" class="w-44" />
        <SelectField v-model="filterProjectId" label="Projecte" :options="projectOptions" />
        <SelectField v-model="filterTaskId" label="Tasca" :options="taskOptions" />
        <ToggleChip :active="ignoreDates" @toggle="ignoreDates = !ignoreDates">Totes les dates</ToggleChip>
      </FilterBar>
      <table class="mt-3 min-w-full divide-y divide-neutral-200 text-sm">
        <thead><tr class="text-left text-xs uppercase text-neutral-500"><th class="py-2">Data</th><th>Projecte</th><th>Tasca</th><th>Minuts</th><th>Descripció</th><th></th></tr></thead>
        <tbody class="divide-y divide-neutral-100">
          <tr v-for="e in filtered" :key="e.id">
            <td class="py-2">{{ formatDate(e.worked_on) }}</td>
            <td>{{ e.project?.name ?? '—' }}</td>
            <td>{{ e.task?.title ?? '—' }}</td>
            <td>{{ fmt(e.minutes) }}</td>
            <td>{{ e.description || '—' }}</td>
            <td class="py-2">
              <div class="flex gap-3">
                <button type="button" @click="openEdit(e)" class="text-xs text-brand-600 hover:underline">Editar</button>
                <button type="button" @click="toDelete = e" class="text-xs text-danger-600 hover:underline">Eliminar</button>
              </div>
            </td>
          </tr>
          <tr v-if="!filtered.length"><td colspan="6" class="py-3 text-center text-neutral-500">Cap imputació en el rang seleccionat.</td></tr>
        </tbody>
      </table>
    </Card>

    <QuickAddTimeEntry :open="quickOpen" :project-id="null" :editing="editing" :last-entry="editing ? null : (entries[0] ?? null)" @close="quickOpen = false" @saved="() => { quickOpen = false; load(); }" />
    <ConfirmDialog
      :open="toDelete !== null"
      title="Eliminar imputació"
      :message="`Segur que vols eliminar aquesta imputació de ${toDelete?.minutes ?? 0} min?`"
      danger
      confirm-label="Eliminar"
      @confirm="confirmDelete"
      @cancel="toDelete = null"
    />
  </AppShell>
</template>
