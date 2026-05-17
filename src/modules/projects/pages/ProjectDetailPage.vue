<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  getProject, updateProject, deleteProject, changeProjectStatus, addHoursPack,
} from '../api/projects';
import type { Project, ProjectStatus } from '../types';
import { PROJECT_STATUS_LABELS } from '../types';
import { extractErrorMessage } from '@/shared/http/errors';
import { useAsyncAction } from '@/shared/composables/useAsyncAction';
import { formatDate } from '@/shared/utils/date';
import AppShell from '@/shared/components/AppShell.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog.vue';
import DangerButton from '@/shared/components/ui/DangerButton.vue';
import NotFoundFallback from '@/shared/components/ui/NotFoundFallback.vue';
import SubmitButton from '@/shared/components/form/SubmitButton.vue';
import TextField from '@/shared/components/form/TextField.vue';
import ProjectStatusBadge from '../components/ProjectStatusBadge.vue';
import ProjectStatusSelector from '../components/ProjectStatusSelector.vue';
import MoneyText from '../components/MoneyText.vue';

const route = useRoute();
const router = useRouter();
const project = ref<Project | null>(null);
const loadError = ref<string | null>(null);
const showDelete = ref(false);
const pendingStatus = ref<ProjectStatus | null>(null);

const { run, loading, errorMsg: actionError } = useAsyncAction();
const errorMsg = computed(() => actionError.value ?? loadError.value);

const pack = ref({ hours: '', priceEuros: '', reason: 'Ampliació' });

function clientName(p: Project): string {
  if (p.is_internal) return 'Projecte intern';
  return p.client_company?.name ?? p.client_person?.full_name ?? '—';
}

async function load() {
  loadError.value = null;
  try {
    project.value = await getProject(Number(route.params.id));
  } catch (e) {
    loadError.value = (e as { response?: { status?: number } })?.response?.status === 404
      ? 'Aquest projecte no existeix o ha estat eliminat.'
      : extractErrorMessage(e, 'No s\'ha pogut carregar el projecte.');
    console.error(e);
  }
}

function onSelectStatus(next: ProjectStatus) {
  pendingStatus.value = next;
}

function confirmStatus() {
  if (!project.value || !pendingStatus.value) return;
  return run(async () => {
    await changeProjectStatus(project.value!.id, pendingStatus.value!);
    pendingStatus.value = null;
    await load();
  }, 'No s\'ha pogut canviar l\'estat.');
}

function saveName() {
  if (!project.value) return;
  return run(async () => {
    await updateProject(project.value!.id, { name: project.value!.name });
    await load();
  }, 'No s\'han pogut desar els canvis.');
}

function submitPack() {
  if (!project.value) return;
  return run(async () => {
    await addHoursPack(project.value!.id, {
      hours: Number(pack.value.hours),
      price_cents: Math.round(Number(pack.value.priceEuros) * 100),
      currency: 'EUR',
      reason: pack.value.reason || 'Ampliació',
    });
    pack.value = { hours: '', priceEuros: '', reason: 'Ampliació' };
    await load();
  }, 'No s\'ha pogut afegir la bossa d\'hores.');
}

function destroy() {
  if (!project.value) return;
  return run(async () => {
    await deleteProject(project.value!.id);
    router.push('/projects');
  }, 'No s\'ha pogut eliminar el projecte.');
}

onMounted(load);
</script>

<template>
  <AppShell>
    <NotFoundFallback
      v-if="errorMsg && !project"
      :message="errorMsg"
      back-to="/projects"
      back-label="Tornar al llistat"
    />
    <template v-if="project">
      <header class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-semibold">{{ project.name }}</h1>
          <p class="text-sm text-neutral-500">{{ clientName(project) }}</p>
        </div>
        <div class="flex items-center gap-3">
          <ProjectStatusBadge :status="project.status" />
          <ProjectStatusSelector :current="project.status" @select="onSelectStatus" />
        </div>
      </header>

      <AlertMessage v-if="errorMsg" variant="error" :message="errorMsg" />

      <section class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div class="rounded border border-neutral-200 p-4">
          <p class="text-xs text-neutral-500">Preu total</p>
          <p class="text-lg font-semibold"><MoneyText :money="project.total_price" /></p>
        </div>
        <div class="rounded border border-neutral-200 p-4">
          <p class="text-xs text-neutral-500">Hores pressupostades</p>
          <p class="text-lg font-semibold">{{ project.budgeted_hours }} h</p>
        </div>
        <div class="rounded border border-neutral-200 p-4">
          <p class="text-xs text-neutral-500">Inici</p>
          <p class="text-lg font-semibold">{{ formatDate(project.started_at, '—') }}</p>
        </div>
        <div class="rounded border border-neutral-200 p-4">
          <p class="text-xs text-neutral-500">Entrega</p>
          <p class="text-lg font-semibold">{{ formatDate(project.due_at, '—') }}</p>
        </div>
      </section>

      <section class="rounded border border-neutral-200 p-4">
        <h2 class="mb-2 text-lg font-medium">Nom</h2>
        <TextField v-model="project.name" label="Nom del projecte" />
        <SubmitButton class="mt-2" :loading="loading" @click="saveName">Desar canvis</SubmitButton>
      </section>

      <section class="rounded border border-neutral-200 p-4">
        <h2 class="mb-3 text-lg font-medium">Bosses d'hores ({{ project.hours_packs?.length ?? 0 }})</h2>
        <table class="mb-4 min-w-full divide-y divide-neutral-200 text-sm">
          <thead>
            <tr class="text-left text-xs uppercase text-neutral-500">
              <th class="py-2">Data</th><th>Hores</th><th>Preu</th><th>Concepte</th><th>Lead</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            <tr v-for="(hp, i) in project.hours_packs ?? []" :key="hp.id">
              <td class="py-2">{{ formatDate(hp.dated_on, '—') }}</td>
              <td>{{ hp.hours }} h</td>
              <td><MoneyText :money="hp.price" /></td>
              <td>{{ i === 0 ? 'Venda inicial' : hp.reason }}</td>
              <td>{{ hp.source_lead_id ? `#${hp.source_lead_id}` : '—' }}</td>
            </tr>
            <tr v-if="(project.hours_packs?.length ?? 0) === 0">
              <td colspan="5" class="py-3 text-center text-neutral-500">Cap bossa d'hores encara.</td>
            </tr>
          </tbody>
        </table>

        <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
          <TextField v-model="pack.hours" label="Hores ampliació" placeholder="10" />
          <TextField v-model="pack.priceEuros" label="Preu (€)" placeholder="1200" />
          <TextField v-model="pack.reason" label="Concepte" />
          <div class="flex items-end">
            <SubmitButton :loading="loading" @click="submitPack">Afegir ampliació</SubmitButton>
          </div>
        </div>
        <p class="mt-2 text-xs text-neutral-500">Afegir una ampliació a un projecte acabat/arxivat el reobre automàticament.</p>
      </section>

      <div class="flex justify-end">
        <DangerButton @click="showDelete = true">Eliminar Projecte</DangerButton>
      </div>

      <ConfirmDialog
        :open="pendingStatus !== null"
        title="Canviar estat"
        :message="`Vols canviar l'estat del projecte a ${pendingStatus ? PROJECT_STATUS_LABELS[pendingStatus] : ''}?`"
        @confirm="confirmStatus"
        @cancel="pendingStatus = null"
      />
      <ConfirmDialog
        :open="showDelete"
        title="Eliminar Projecte"
        message="Es farà soft-delete. Es pot recuperar via tinker si cal."
        danger
        @confirm="destroy"
        @cancel="showDelete = false"
      />
    </template>
  </AppShell>
</template>
