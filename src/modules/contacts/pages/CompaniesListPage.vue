<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { listCompanies } from '../api/companies';
import AppShell from '@/shared/components/AppShell.vue';
import DataTable from '@/shared/components/ui/DataTable.vue';
import Pagination from '@/shared/components/ui/Pagination.vue';
import TextField from '@/shared/components/form/TextField.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import Button from '@/shared/components/ui/Button.vue';
import FilterBar from '@/shared/components/ui/FilterBar.vue';
import PageHeader from '@/shared/components/ui/PageHeader.vue';
import ToggleChip from '@/shared/components/ui/ToggleChip.vue';
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
    <PageHeader title="Empreses">
      <template #actions>
        <Button variant="primary" :to="{ path: '/companies/new' }">+ Nova empresa</Button>
      </template>
    </PageHeader>

    <FilterBar>
      <TextField v-model="search" label="Cerca" class="w-72" placeholder="Nom de l'empresa…" />
      <ToggleChip :active="onlyClients" @toggle="onlyClients = !onlyClients">Només clients</ToggleChip>
    </FilterBar>

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
  </AppShell>
</template>
