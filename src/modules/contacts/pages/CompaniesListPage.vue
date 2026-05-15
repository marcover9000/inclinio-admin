<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { listCompanies } from '../api/companies';
import AppShell from '@/shared/components/AppShell.vue';
import DataTable from '@/shared/components/ui/DataTable.vue';
import Pagination from '@/shared/components/ui/Pagination.vue';
import TextField from '@/shared/components/form/TextField.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import ClientBadge from '../components/ClientBadge.vue';
import { usePaginatedResource } from '@/shared/composables/usePaginatedResource';

const search = ref('');
const onlyClients = ref(false);

const { data, loading, errorMsg, page } = usePaginatedResource({
  fetcher: (p) => listCompanies({
    page: p,
    search: search.value || undefined,
    is_client: onlyClients.value || undefined,
  }),
  watchSources: [search, onlyClients],
});
</script>

<template>
  <AppShell>
    <div class="space-y-4 p-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">Empreses</h1>
        <RouterLink to="/companies/new" class="rounded bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700">+ Nova empresa</RouterLink>
      </div>
      <div class="flex gap-4">
        <TextField v-model="search" label="Cerca" placeholder="Nom de l'empresa…" />
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="onlyClients" /> Només clients
        </label>
      </div>
      <AlertMessage v-if="errorMsg" variant="error" :message="errorMsg" />
      <DataTable
        :rows="data?.data ?? []"
        :loading="loading"
        :columns="[
          { key: 'name', label: 'Nom' },
          { key: 'vat', label: 'VAT/CIF' },
          { key: 'is_client', label: 'Client' },
        ]"
      >
        <template #cell-name="{ row }">
          <RouterLink :to="`/companies/${row.id}`" class="text-brand-600 hover:underline">{{ row.name }}</RouterLink>
        </template>
        <template #cell-vat="{ row }">{{ row.vat ?? '—' }}</template>
        <template #cell-is_client="{ row }">
          <ClientBadge v-if="row.is_client" :since="row.became_client_at" />
          <span v-else>—</span>
        </template>
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
