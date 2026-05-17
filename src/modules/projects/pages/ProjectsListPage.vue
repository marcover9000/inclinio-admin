<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { listProjects } from '../api/projects';
import { PROJECT_STATUSES } from '../types';
import type { Project, ProjectStatus } from '../types';
import { formatDate } from '@/shared/utils/date';
import { usePaginatedResource } from '@/shared/composables/usePaginatedResource';
import AppShell from '@/shared/components/AppShell.vue';
import DataTable from '@/shared/components/ui/DataTable.vue';
import Pagination from '@/shared/components/ui/Pagination.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import ProjectStatusBadge from '../components/ProjectStatusBadge.vue';
import MoneyText from '../components/MoneyText.vue';

const search = ref('');
const selectedStatuses = ref<ProjectStatus[]>([...PROJECT_STATUSES]);
const onlyInternal = ref(false);

const { data, loading, errorMsg, page } = usePaginatedResource<Project>({
  fetcher: (p) => {
    if (selectedStatuses.value.length === 0) {
      return Promise.resolve({
        data: [],
        meta: { current_page: 1, last_page: 1, total: 0, per_page: 20 },
      });
    }
    return listProjects({
      page: p,
      status: selectedStatuses.value,
      is_internal: onlyInternal.value ? true : undefined,
      search: search.value || undefined,
    });
  },
  watchSources: [search, selectedStatuses, onlyInternal],
  watchDeep: true,
});

function toggleStatus(s: ProjectStatus) {
  selectedStatuses.value = selectedStatuses.value.includes(s)
    ? selectedStatuses.value.filter((x) => x !== s)
    : [...selectedStatuses.value, s];
}

function clientName(p: Project): string {
  if (p.is_internal) return 'Intern';
  return p.client_company?.name ?? p.client_person?.full_name ?? '—';
}
</script>

<template>
  <AppShell>
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Projectes</h1>
      <RouterLink to="/projects/new" class="rounded bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700">+ Nou Projecte</RouterLink>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <input
        v-model="search"
        placeholder="Cerca per nom…"
        class="rounded border border-neutral-300 text-sm"
      />
      <button
        v-for="s in PROJECT_STATUSES"
        :key="s"
        type="button"
        @click="toggleStatus(s)"
        :class="[
          'rounded-full border px-3 py-1 text-xs',
          selectedStatuses.includes(s) ? 'border-brand-300 bg-brand-50 text-brand-800' : 'border-neutral-300 text-neutral-500',
        ]"
      >
        {{ s }}
      </button>
      <label class="flex items-center gap-1 text-xs text-neutral-600">
        <input type="checkbox" v-model="onlyInternal" /> Només interns
      </label>
    </div>

    <AlertMessage v-if="errorMsg" variant="error" :message="errorMsg" />

    <DataTable
      :rows="data?.data ?? []"
      :loading="loading"
      :columns="[
        { key: 'name', label: 'Projecte' },
        { key: 'client', label: 'Client' },
        { key: 'status', label: 'Estat' },
        { key: 'hours', label: 'Hores' },
        { key: 'price', label: 'Preu' },
        { key: 'created_at', label: 'Creat' },
      ]"
    >
      <template #cell-name="{ row }">
        <RouterLink :to="`/projects/${row.id}`" class="text-brand-600 hover:underline">{{ row.name }}</RouterLink>
      </template>
      <template #cell-client="{ row }">{{ clientName(row) }}</template>
      <template #cell-status="{ row }"><ProjectStatusBadge :status="row.status" /></template>
      <template #cell-hours="{ row }">{{ row.budgeted_hours }} h</template>
      <template #cell-price="{ row }"><MoneyText :money="row.total_price" /></template>
      <template #cell-created_at="{ row }">{{ formatDate(row.created_at) }}</template>
    </DataTable>

    <Pagination
      v-if="data"
      :current-page="data.meta.current_page"
      :last-page="data.meta.last_page"
      :total="data.meta.total"
      @change="(p) => (page = p)"
    />
  </AppShell>
</template>
