<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getPerson, updatePerson, deletePerson } from '../api/people';
import type { Person } from '../types';
import type { Lead } from '@/modules/crm/types';
import { extractErrorMessage } from '@/shared/http/errors';
import { useAsyncAction } from '@/shared/composables/useAsyncAction';
import AppShell from '@/shared/components/AppShell.vue';
import TextField from '@/shared/components/form/TextField.vue';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import Button from '@/shared/components/ui/Button.vue';
import Card from '@/shared/components/ui/Card.vue';
import NotFoundFallback from '@/shared/components/ui/NotFoundFallback.vue';
import PageHeader from '@/shared/components/ui/PageHeader.vue';
import ClientBadge from '../components/ClientBadge.vue';
import CompanyPicker from '../components/CompanyPicker.vue';
import LeadCardRow from '@/modules/crm/components/LeadCardRow.vue';
import ContactProjectsList from '../components/ContactProjectsList.vue';

type PersonWithLeads = Person & { leads?: Lead[] };

const route = useRoute();
const router = useRouter();
const person = ref<PersonWithLeads | null>(null);
const loadError = ref<string | null>(null);
const showDelete = ref(false);

const { run, loading, errorMsg: actionError } = useAsyncAction();
// L'alerta mostra l'error d'acció (desar/eliminar) si n'hi ha, si no el de càrrega.
const errorMsg = computed(() => actionError.value ?? loadError.value);

const editCompanyId = ref<number | null>(null);
const editCompanyName = ref<string>('');

async function load() {
  loadError.value = null;
  try {
    person.value = await getPerson(Number(route.params.id)) as PersonWithLeads;
    editCompanyId.value = person.value.company?.id ?? null;
    editCompanyName.value = person.value.company?.name ?? '';
  } catch (e) {
    loadError.value = (e as { response?: { status?: number } })?.response?.status === 404
      ? 'Aquest registre no existeix o ha estat eliminat.'
      : extractErrorMessage(e, 'No s\'ha pogut carregar el registre.');
    console.error(e);
  }
}

function clearCompany() {
  editCompanyId.value = null;
  editCompanyName.value = '';
}

function save() {
  if (!person.value) return;
  return run(async () => {
    await updatePerson(person.value!.id, {
      first_name: person.value!.first_name,
      last_name: person.value!.last_name,
      email: person.value!.email,
      phone: person.value!.phone,
      position: person.value!.position,
      company_id: editCompanyId.value,
    });
    await load();
  }, 'No s\'han pogut desar els canvis.');
}

async function destroy() {
  if (!person.value) return;
  const ok = await run(async () => {
    await deletePerson(person.value!.id);
    router.push('/people');
  }, 'No s\'ha pogut eliminar.');
  if (!ok) showDelete.value = false;
}

onMounted(load);
</script>

<template>
  <AppShell>
    <NotFoundFallback v-if="errorMsg && !person" :message="errorMsg" back-to="/people" back-label="Tornar al llistat" />
    <template v-if="person">
      <PageHeader :title="person.full_name">
        <template #badge>
          <ClientBadge v-if="person.is_client" :since="person.became_client_at" />
        </template>
        <template #actions>
          <Button variant="danger" @click="showDelete = true">Eliminar</Button>
        </template>
      </PageHeader>

      <AlertMessage v-if="errorMsg" variant="error" :message="errorMsg" />

      <form @submit.prevent="save" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField v-model="person.first_name" label="Nom" />
        <TextField :model-value="person.last_name ?? ''" @update:model-value="v => person!.last_name = v" label="Cognoms" />
        <TextField :model-value="person.email ?? ''" @update:model-value="v => person!.email = v" label="Email" />
        <TextField :model-value="person.phone ?? ''" @update:model-value="v => person!.phone = v" label="Telèfon" />
        <TextField :model-value="person.position ?? ''" @update:model-value="v => person!.position = v" label="Càrrec" />
        <div class="md:col-span-2 relative">
          <p class="text-sm font-medium text-neutral-700 mb-1">Empresa</p>
          <div v-if="editCompanyId !== null" class="flex items-center gap-2">
            <span class="rounded bg-neutral-100 px-3 py-1.5 text-sm">{{ editCompanyName }}</span>
            <Button type="button" variant="danger" size="sm" @click="clearCompany">Desvincular</Button>
          </div>
          <CompanyPicker
            v-else
            v-model="editCompanyId"
            v-model:name="editCompanyName"
            placeholder="Cerca empresa…"
          />
        </div>
        <div class="md:col-span-2 flex justify-end">
          <Button type="submit" variant="primary" :loading="loading">Desar canvis</Button>
        </div>
      </form>

      <Card :title="`Leads (${person.leads?.length ?? 0})`">
        <template #actions>
          <Button variant="primary" size="sm" :to="{ path: `/leads/new`, query: { personId: person.id } }">+ Nou lead per aquesta persona</Button>
        </template>
        <p v-if="!person.leads?.length" class="text-sm text-neutral-500">Aquesta persona encara no té cap lead.</p>
        <div v-else class="space-y-2">
          <LeadCardRow v-for="lead in person.leads" :key="lead.id" :lead="lead" />
        </div>
      </Card>

      <Card title="Projectes">
        <ContactProjectsList :person-id="person.id" />
      </Card>

      <ConfirmDialog
        :open="showDelete"
        title="Eliminar persona"
        :message="`Estàs segur que vols eliminar ${person.full_name}? (soft-delete)`"
        danger
        @confirm="destroy"
        @cancel="showDelete = false"
      />
    </template>
  </AppShell>
</template>
