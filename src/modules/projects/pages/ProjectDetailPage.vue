<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  getProject, updateProject, deleteProject, changeProjectStatus, addHoursPack,
  updateHoursPack, deleteHoursPack,
} from '../api/projects';
import type { HoursPack, Project, ProjectStatus } from '../types';
import { PROJECT_STATUS_LABELS } from '../types';
import { extractErrorMessage } from '@/shared/http/errors';
import { emptyPackState, buildPackPayload, packIsValid, packStateFromResource } from '../pack';
import type { PackFormState } from '../pack';
import { useAsyncAction } from '@/shared/composables/useAsyncAction';
import { formatDate } from '@/shared/utils/date';
import AppShell from '@/shared/components/AppShell.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog.vue';
import DangerButton from '@/shared/components/ui/DangerButton.vue';
import NotFoundFallback from '@/shared/components/ui/NotFoundFallback.vue';
import SubmitButton from '@/shared/components/form/SubmitButton.vue';
import TextField from '@/shared/components/form/TextField.vue';
import PackFields from '../components/PackFields.vue';
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

// Mode edició pack: null = mode "afegir ampliació" (POST), number = id del pack editat (PATCH)
const editingPackId = ref<number | null>(null);
const packState = ref<PackFormState>(emptyPackState('Ampliació'));
const packValid = computed(() => packIsValid(packState.value));

// Pack pendent d'eliminar
const packToDelete = ref<HoursPack | null>(null);

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

function startEditPack(hp: HoursPack) {
  editingPackId.value = hp.id;
  packState.value = packStateFromResource(hp);
}

function cancelEditPack() {
  editingPackId.value = null;
  packState.value = emptyPackState('Ampliació');
}

function submitPack() {
  if (!project.value) return;
  if (editingPackId.value !== null) {
    const packId = editingPackId.value;
    return run(async () => {
      project.value = await updateHoursPack(project.value!.id, packId, buildPackPayload(packState.value));
      cancelEditPack();
    }, 'No s\'ha pogut desar el pack.');
  }
  return run(async () => {
    await addHoursPack(project.value!.id, buildPackPayload(packState.value));
    packState.value = emptyPackState('Ampliació');
    await load();
  }, 'No s\'ha pogut afegir la bossa d\'hores.');
}

function confirmDeletePack() {
  if (!project.value || !packToDelete.value) return;
  const packId = packToDelete.value.id;
  return run(async () => {
    await deleteHoursPack(project.value!.id, packId);
    packToDelete.value = null;
    await load();
  }, 'No s\'ha pogut eliminar el pack.');
}

function destroy() {
  if (!project.value) return;
  return run(async () => {
    await deleteProject(project.value!.id);
    router.push('/projects');
  }, 'No s\'ha pogut eliminar el projecte.');
}

function packHoursDisplay(hp: HoursPack): string {
  if (hp.hours == null) return '—';
  return `${hp.hours} h`;
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
          <DangerButton @click="showDelete = true">Eliminar Projecte</DangerButton>
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
              <th class="py-2">Data</th><th>Hores</th><th>Preu</th><th>Concepte</th><th>Lead</th><th></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            <tr v-for="(hp, i) in project.hours_packs ?? []" :key="hp.id">
              <td class="py-2">{{ formatDate(hp.dated_on, '—') }}</td>
              <td>{{ packHoursDisplay(hp) }}</td>
              <td><MoneyText :money="hp.price" /></td>
              <td>{{ i === 0 ? 'Venda inicial' : hp.reason }}</td>
              <td>{{ hp.source_lead_id ? `#${hp.source_lead_id}` : '—' }}</td>
              <td class="py-2">
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    @click="startEditPack(hp)"
                    class="text-xs text-brand-600 hover:underline"
                  >Editar</button>
                  <button
                    type="button"
                    @click="packToDelete = hp"
                    class="text-xs text-danger-600 hover:underline"
                  >Eliminar</button>
                </div>
              </td>
            </tr>
            <tr v-if="(project.hours_packs?.length ?? 0) === 0">
              <td colspan="6" class="py-3 text-center text-neutral-500">Cap bossa d'hores encara.</td>
            </tr>
          </tbody>
        </table>

        <div v-if="editingPackId !== null" class="mb-2 flex items-center justify-between">
          <p class="text-sm font-medium text-neutral-700">Editant pack #{{ editingPackId }}</p>
          <button type="button" @click="cancelEditPack" class="text-xs text-neutral-600 hover:underline">Cancel·lar</button>
        </div>
        <PackFields v-model="packState" />
        <SubmitButton
          class="mt-3"
          :loading="loading"
          :disabled="!packValid"
          @click="submitPack"
        >{{ editingPackId !== null ? 'Desar pack' : 'Afegir ampliació' }}</SubmitButton>
        <p v-if="editingPackId === null" class="mt-2 text-xs text-neutral-500">Afegir una ampliació a un projecte acabat/arxivat el reobre automàticament.</p>
      </section>

      <ConfirmDialog
        :open="pendingStatus !== null"
        title="Canviar estat"
        :message="`Vols canviar l'estat del projecte a ${pendingStatus ? PROJECT_STATUS_LABELS[pendingStatus] : ''}?`"
        @confirm="confirmStatus"
        @cancel="pendingStatus = null"
      />
      <ConfirmDialog
        :open="packToDelete !== null"
        title="Eliminar pack"
        :message="`Estàs segur que vols eliminar el pack «${packToDelete?.reason}»? (soft-delete)`"
        danger
        confirm-label="Eliminar"
        @confirm="confirmDeletePack"
        @cancel="packToDelete = null"
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
