<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { listProjects } from '../api/projects';
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS } from '../types';
import type { Project, ProjectStatus } from '../types';
import { formatDate } from '@/shared/utils/date';
import { usePaginatedResource } from '@/shared/composables/usePaginatedResource';
import AppShell from '@/shared/components/AppShell.vue';
import DataTable from '@/shared/components/ui/DataTable.vue';
import Pagination from '@/shared/components/ui/Pagination.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import Button from '@/shared/components/ui/Button.vue';
import FilterBar from '@/shared/components/ui/FilterBar.vue';
import PageHeader from '@/shared/components/ui/PageHeader.vue';
import ToggleChip from '@/shared/components/ui/ToggleChip.vue';
import TextField from '@/shared/components/form/TextField.vue';
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
    <PageHeader title="Projectes">
      <template #actions>
        <Button variant="primary" :to="{ path: '/projects/new' }">+ Nou Projecte</Button>
      </template>
    </PageHeader>

    <FilterBar>
      <TextField v-model="search" label="Cerca" placeholder="Cerca per nom…" class="w-72" />
      <ToggleChip
        v-for="s in PROJECT_STATUSES"
        :key="s"
        :active="selectedStatuses.includes(s)"
        @toggle="toggleStatus(s)"
      >{{ PROJECT_STATUS_LABELS[s] }}</ToggleChip>
      <ToggleChip :active="onlyInternal" @toggle="onlyInternal = !onlyInternal">Només interns</ToggleChip>
    </FilterBar>

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
