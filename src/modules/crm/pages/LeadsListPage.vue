<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { listLeads } from '../api/leads';
import type { Lead, LeadStatus, Paginated } from '../types';
import AppShell from '@/shared/components/AppShell.vue';
import DataTable from '@/shared/components/ui/DataTable.vue';
import Pagination from '@/shared/components/ui/Pagination.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import LeadStatusBadge from '../components/LeadStatusBadge.vue';
import LeadFiltersBar from '../components/LeadFiltersBar.vue';

const data = ref<Paginated<Lead> | null>(null);
const loading = ref(false);
const errorMsg = ref<string | null>(null);
const search = ref('');
const selectedStatuses = ref<LeadStatus[]>(['new', 'contacted', 'qualified', 'proposal']);
const selectedTags = ref<string[]>([]);
const page = ref(1);

async function load() {
  loading.value = true;
  errorMsg.value = null;
  try {
    if (selectedStatuses.value.length === 0) {
      data.value = {
        data: [],
        meta: { current_page: 1, last_page: 1, total: 0, per_page: 20 },
      };
      return;
    }
    data.value = await listLeads({
      page: page.value,
      status: selectedStatuses.value,
      tags: selectedTags.value.length ? selectedTags.value : undefined,
      search: search.value || undefined,
    });
  } catch (e: any) {
    errorMsg.value = e?.response?.data?.message ?? 'No s\'han pogut carregar les dades.';
    console.error(e);
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch([search, selectedStatuses, selectedTags, page], load, { deep: true });
</script>

<template>
  <AppShell>
    <div class="space-y-4 p-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">Leads</h1>
        <RouterLink to="/leads/new" class="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">+ Nou Lead</RouterLink>
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
          <RouterLink :to="`/leads/${row.id}`" class="text-blue-600 hover:underline">
            {{ row.person?.full_name ?? '(persona eliminada)' }}<span v-if="row.company"> · {{ row.company.name }}</span>
          </RouterLink>
        </template>
        <template #cell-subject="{ row }">
          <div class="max-w-md">
            <p class="truncate text-sm text-gray-700" :title="row.message ?? ''">
              {{ row.message?.trim() ? row.message.slice(0, 80) + (row.message.length > 80 ? '…' : '') : '—' }}
            </p>
            <div v-if="row.tags.length" class="mt-1 flex flex-wrap gap-1">
              <span v-for="tag in row.tags" :key="tag" class="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{{ tag }}</span>
            </div>
          </div>
        </template>
        <template #cell-status="{ row }"><LeadStatusBadge :status="row.status" /></template>
        <template #cell-created_at="{ row }">{{ new Date(row.created_at).toLocaleDateString('ca-ES') }}</template>
      </DataTable>
      <Pagination
        v-if="data"
        :current-page="data.meta.current_page"
        :last-page="data.meta.last_page"
        :total="data.meta.total"
        @change="(p) => (page = p)"
      />
    </div>
  </AppShell>
</template>
