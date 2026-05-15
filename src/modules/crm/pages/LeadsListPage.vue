<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { listLeads } from '../api/leads';
import { LEAD_OPEN_STATUSES } from '../types';
import type { Lead, LeadStatus } from '../types';
import { formatDate } from '@/shared/utils/date';
import { usePaginatedResource } from '@/shared/composables/usePaginatedResource';
import AppShell from '@/shared/components/AppShell.vue';
import DataTable from '@/shared/components/ui/DataTable.vue';
import Pagination from '@/shared/components/ui/Pagination.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import LeadStatusBadge from '../components/LeadStatusBadge.vue';
import LeadFiltersBar from '../components/LeadFiltersBar.vue';

const search = ref('');
const selectedStatuses = ref<LeadStatus[]>([...LEAD_OPEN_STATUSES]);
const selectedTags = ref<string[]>([]);

const { data, loading, errorMsg, page } = usePaginatedResource<Lead>({
  fetcher: (p) => {
    // Sense estats seleccionats no té sentit consultar: pàgina buida.
    if (selectedStatuses.value.length === 0) {
      return Promise.resolve({
        data: [],
        meta: { current_page: 1, last_page: 1, total: 0, per_page: 20 },
      });
    }
    return listLeads({
      page: p,
      status: selectedStatuses.value,
      tags: selectedTags.value.length ? selectedTags.value : undefined,
      search: search.value || undefined,
    });
  },
  watchSources: [search, selectedStatuses, selectedTags],
  watchDeep: true,
});
</script>

<template>
  <AppShell>
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Leads</h1>
      <RouterLink to="/leads/new" class="rounded bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700">+ Nou Lead</RouterLink>
    </div>
    <LeadFiltersBar
      v-model:search="search"
      v-model:selectedStatuses="selectedStatuses"
      v-model:selectedTags="selectedTags"
      :available-tags="[]"
    />
    <AlertMessage v-if="errorMsg" variant="error" :message="errorMsg" />
    <DataTable
      :rows="data?.data ?? []"
      :loading="loading"
      :columns="[
        { key: 'name', label: 'Nom + Empresa' },
        { key: 'subject', label: 'Assumpte' },
        { key: 'status', label: 'Estat' },
        { key: 'created_at', label: 'Creat' },
      ]"
    >
      <template #cell-name="{ row }">
        <RouterLink :to="`/leads/${row.id}`" class="text-brand-600 hover:underline">
          {{ row.person?.full_name ?? '(persona eliminada)' }}<span v-if="row.company"> · {{ row.company.name }}</span>
        </RouterLink>
      </template>
      <template #cell-subject="{ row }">
        <div class="max-w-md">
          <p class="truncate text-sm text-neutral-700" :title="row.message ?? ''">
            {{ row.message?.trim() ? row.message.slice(0, 80) + (row.message.length > 80 ? '…' : '') : '—' }}
          </p>
          <div v-if="row.tags.length" class="mt-1 flex flex-wrap gap-1">
            <span v-for="tag in row.tags" :key="tag" class="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600">{{ tag }}</span>
          </div>
        </div>
      </template>
      <template #cell-status="{ row }"><LeadStatusBadge :status="row.status" /></template>
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
