<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  getProject, updateProject, deleteProject, changeProjectStatus, addHoursPack,
  updateHoursPack, deleteHoursPack,
  createTask, updateTask, deleteTask,
  createTimeEntry, updateTimeEntry, deleteTimeEntry,
} from '../api/projects';
import type { HoursPack, Project, ProjectStatus, Task, TaskStatus, TimeEntry } from '../types';
import { PROJECT_STATUS_LABELS, TASK_STATUS_LABELS } from '../types';
import { extractErrorMessage } from '@/shared/http/errors';
import { emptyPackState, buildPackPayload, packIsValid, packStateFromResource } from '../pack';
import type { PackFormState } from '../pack';
import { useAsyncAction } from '@/shared/composables/useAsyncAction';
import { formatDate } from '@/shared/utils/date';
import AppShell from '@/shared/components/AppShell.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import Badge from '@/shared/components/ui/Badge.vue';
import Button from '@/shared/components/ui/Button.vue';
import Card from '@/shared/components/ui/Card.vue';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog.vue';
import Modal from '@/shared/components/ui/Modal.vue';
import NotFoundFallback from '@/shared/components/ui/NotFoundFallback.vue';
import PageHeader from '@/shared/components/ui/PageHeader.vue';
import TextField from '@/shared/components/form/TextField.vue';
import SelectField from '@/shared/components/form/SelectField.vue';
import DateField from '@/shared/components/form/DateField.vue';
import TextareaField from '@/shared/components/form/TextareaField.vue';
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

// ─── Pack inline edit ────────────────────────────────────────────────────────
// Mode edició pack: null = mode "afegir ampliació" (POST), number = id del pack editat (PATCH)
const editingPackId = ref<number | null>(null);
const packState = ref<PackFormState>(emptyPackState('Ampliació'));
const packValid = computed(() => packIsValid(packState.value));

// Pack pendent d'eliminar
const packToDelete = ref<HoursPack | null>(null);

// ─── Task inline edit ────────────────────────────────────────────────────────
// null = mode "afegir tasca" (POST), number = id de la tasca editada (PATCH)
const editingTaskId = ref<number | null>(null);
const taskForm = ref({ title: '', status: 'todo', estimate_hours: '' });

const taskToDelete = ref<Task | null>(null);

const tasks = computed(() => project.value?.tasks ?? []);

const taskStatusOptions = Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({ value, label }));

const taskStatusTone: Record<TaskStatus, 'neutral' | 'info' | 'success'> = {
  todo: 'neutral',
  doing: 'info',
  done: 'success',
};

// ─── TimeEntry / Quick-add ───────────────────────────────────────────────────
const entryToDelete = ref<TimeEntry | null>(null);

const quickAddOpen = ref(false);
const quickAddEditingId = ref<number | null>(null);
const quickAddMinutesError = ref<string | null>(null);

function todayIso(): string {
  const n = new Date();
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
}

const qa = ref<{ worked_on: string; task_id: string; minutes: string; description: string }>({
  worked_on: todayIso(),
  task_id: '',
  minutes: '60',
  description: '',
});

const taskOptions = computed(() => [
  { value: '', label: '(sense tasca)' },
  ...tasks.value.map((t) => ({ value: String(t.id), label: t.title })),
]);

// ─── Shadow rate override ────────────────────────────────────────────────────
const shadowOverrideEuros = ref('');

// ─── Helpers ─────────────────────────────────────────────────────────────────
function clientName(p: Project): string {
  if (p.is_internal) return 'Projecte intern';
  return p.client_company?.name ?? p.client_person?.full_name ?? '—';
}

async function load() {
  loadError.value = null;
  try {
    project.value = await getProject(Number(route.params.id));
    // Sync shadow override field from loaded project
    const override = project.value.shadow_rate_override;
    shadowOverrideEuros.value = override ? String(override.cents / 100) : '';
  } catch (e) {
    loadError.value = (e as { response?: { status?: number } })?.response?.status === 404
      ? 'Aquest projecte no existeix o ha estat eliminat.'
      : extractErrorMessage(e, 'No s\'ha pogut carregar el projecte.');
    console.error(e);
  }
}

// ─── Project actions ──────────────────────────────────────────────────────────
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

function destroy() {
  if (!project.value) return;
  return run(async () => {
    await deleteProject(project.value!.id);
    router.push('/projects');
  }, 'No s\'ha pogut eliminar el projecte.');
}

// ─── Pack actions ─────────────────────────────────────────────────────────────
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

function packHoursDisplay(hp: HoursPack): string {
  if (hp.hours == null) return '—';
  return `${hp.hours} h`;
}

// ─── Task actions ─────────────────────────────────────────────────────────────
function startEditTask(t: Task) {
  editingTaskId.value = t.id;
  taskForm.value = {
    title: t.title,
    status: t.status,
    estimate_hours: t.estimate_hours != null ? String(t.estimate_hours) : '',
  };
}

function cancelEditTask() {
  editingTaskId.value = null;
  taskForm.value = { title: '', status: 'todo', estimate_hours: '' };
}

function submitTask() {
  if (!project.value) return;
  const payload = {
    title: taskForm.value.title.trim(),
    status: taskForm.value.status,
    estimate_hours: taskForm.value.estimate_hours !== '' ? Number(taskForm.value.estimate_hours) : null,
  };
  if (editingTaskId.value !== null) {
    const taskId = editingTaskId.value;
    return run(async () => {
      project.value = await updateTask(project.value!.id, taskId, payload);
      cancelEditTask();
    }, 'No s\'ha pogut desar la tasca.');
  }
  return run(async () => {
    project.value = await createTask(project.value!.id, payload);
    taskForm.value = { title: '', status: 'todo', estimate_hours: '' };
  }, 'No s\'ha pogut afegir la tasca.');
}

function confirmDeleteTask() {
  if (!project.value || !taskToDelete.value) return;
  const taskId = taskToDelete.value.id;
  return run(async () => {
    await deleteTask(project.value!.id, taskId);
    taskToDelete.value = null;
    await load();
  }, 'No s\'ha pogut eliminar la tasca.');
}

// ─── TimeEntry actions ────────────────────────────────────────────────────────
function openQuickAdd() {
  quickAddEditingId.value = null;
  quickAddMinutesError.value = null;
  const entries = project.value?.time_entries ?? [];
  const last = entries.length > 0 ? entries[entries.length - 1] : null;
  qa.value = {
    worked_on: last?.worked_on ?? todayIso(),
    task_id: last?.task_id != null ? String(last.task_id) : '',
    minutes: last ? String(last.minutes) : '60',
    description: '',
  };
  quickAddOpen.value = true;
}

function openEditEntry(e: TimeEntry) {
  quickAddEditingId.value = e.id;
  quickAddMinutesError.value = null;
  qa.value = {
    worked_on: e.worked_on ?? todayIso(),
    task_id: e.task_id != null ? String(e.task_id) : '',
    minutes: String(e.minutes),
    description: e.description,
  };
  quickAddOpen.value = true;
}

function closeQuickAdd() {
  quickAddOpen.value = false;
  quickAddEditingId.value = null;
  quickAddMinutesError.value = null;
}

function submitQuickAdd() {
  if (!project.value) return;
  const mins = Number(qa.value.minutes);
  if (!Number.isInteger(mins) || mins <= 0 || mins % 15 !== 0) {
    quickAddMinutesError.value = 'Els minuts han de ser un múltiple de 15 i > 0.';
    return;
  }
  quickAddMinutesError.value = null;
  const payload = {
    worked_on: qa.value.worked_on || todayIso(),
    minutes: mins,
    description: qa.value.description,
    task_id: qa.value.task_id !== '' ? Number(qa.value.task_id) : null,
  };
  if (quickAddEditingId.value !== null) {
    const entryId = quickAddEditingId.value;
    return run(async () => {
      project.value = await updateTimeEntry(project.value!.id, entryId, payload);
      closeQuickAdd();
    }, 'No s\'ha pogut desar la imputació.');
  }
  return run(async () => {
    project.value = await createTimeEntry(project.value!.id, payload);
    closeQuickAdd();
  }, 'No s\'ha pogut afegir la imputació.');
}

function confirmDeleteEntry() {
  if (!project.value || !entryToDelete.value) return;
  const entryId = entryToDelete.value.id;
  return run(async () => {
    await deleteTimeEntry(project.value!.id, entryId);
    entryToDelete.value = null;
    await load();
  }, 'No s\'ha pogut eliminar la imputació.');
}

function taskTitleById(taskId: number | null): string {
  if (taskId == null) return '—';
  return tasks.value.find((t) => t.id === taskId)?.title ?? '—';
}

// ─── Shadow override action ───────────────────────────────────────────────────
function saveShadowOverride() {
  if (!project.value) return;
  const euros = shadowOverrideEuros.value.trim();
  return run(async () => {
    project.value = await updateProject(project.value!.id, {
      shadow_rate_override_cents: euros === '' ? null : Math.round(Number(euros) * 100),
      shadow_rate_override_currency: euros === '' ? null : 'EUR',
    });
    const override = project.value!.shadow_rate_override;
    shadowOverrideEuros.value = override ? String(override.cents / 100) : '';
  }, 'No s\'ha pogut desar la tarifa-ombra.');
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
      <PageHeader :title="project.name" :subtitle="clientName(project)">
        <template #badge>
          <ProjectStatusBadge :status="project.status" />
        </template>
        <template #actions>
          <ProjectStatusSelector :current="project.status" @select="onSelectStatus" />
          <Button variant="danger" @click="showDelete = true">Eliminar Projecte</Button>
        </template>
      </PageHeader>

      <AlertMessage v-if="errorMsg" variant="error" :message="errorMsg" />

      <!-- Stats tiles -->
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
        <div class="rounded border border-neutral-200 p-4">
          <p class="text-xs text-neutral-500">Consumides</p>
          <p class="text-lg font-semibold">{{ project.aggregates != null ? `${project.aggregates.consumed_hours} h` : '—' }}</p>
        </div>
        <div class="rounded border border-neutral-200 p-4">
          <p class="text-xs text-neutral-500">Desviació</p>
          <p class="text-lg font-semibold">{{ project.aggregates?.overrun_percent != null ? `${project.aggregates.overrun_percent} %` : '—' }}</p>
        </div>
        <div class="rounded border border-neutral-200 p-4">
          <p class="text-xs text-neutral-500">Cost teòric</p>
          <p class="text-lg font-semibold"><MoneyText :money="project.aggregates?.theoretical_cost ?? null" /></p>
        </div>
        <div class="rounded border border-neutral-200 p-4">
          <p class="text-xs text-neutral-500">Marge real</p>
          <p class="text-lg font-semibold">
            <template v-if="project.is_internal || project.aggregates?.real_margin == null">—</template>
            <MoneyText v-else :money="project.aggregates.real_margin" />
          </p>
        </div>
      </section>

      <!-- Nom -->
      <Card title="Nom">
        <form @submit.prevent="saveName" class="space-y-3">
          <TextField v-model="project.name" label="Nom del projecte" />
          <div class="flex justify-end">
            <Button type="submit" variant="primary" :loading="loading">Desar canvis</Button>
          </div>
        </form>
      </Card>

      <!-- Tarifa-ombra override -->
      <Card title="Tarifa-ombra">
        <form @submit.prevent="saveShadowOverride" class="space-y-3">
          <TextField
            v-model="shadowOverrideEuros"
            label="Override €/h (opcional, buit = global)"
          />
          <p class="text-xs text-neutral-500">
            Tarifa efectiva: {{ project.aggregates?.shadow_rate?.formatted ?? '—' }}
          </p>
          <div class="flex justify-end">
            <Button type="submit" variant="primary" :loading="loading">Desar</Button>
          </div>
        </form>
      </Card>

      <!-- Bosses d'hores -->
      <Card :title="`Bosses d'hores (${project.hours_packs?.length ?? 0})`">
        <table class="min-w-full divide-y divide-neutral-200 text-sm">
          <thead>
            <tr class="text-left text-xs uppercase text-neutral-500">
              <th class="py-2">Data</th><th>Hores</th><th>Preu</th><th>Concepte</th><th>Lead</th><th></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            <tr v-for="hp in project.hours_packs ?? []" :key="hp.id">
              <td class="py-2">{{ formatDate(hp.dated_on, '—') }}</td>
              <td>{{ packHoursDisplay(hp) }}</td>
              <td><MoneyText :money="hp.price" /></td>
              <td>{{ hp.reason }}</td>
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

        <div v-if="editingPackId !== null" class="flex items-center justify-between">
          <p class="text-sm font-medium text-neutral-700">Editant pack #{{ editingPackId }}</p>
          <button type="button" @click="cancelEditPack" class="text-xs text-neutral-600 hover:underline">Cancel·lar</button>
        </div>
        <PackFields v-model="packState" />
        <div class="flex justify-end">
          <Button type="submit" variant="primary" :loading="loading" :disabled="!packValid" @click="submitPack">
            {{ editingPackId !== null ? 'Desar pack' : 'Afegir ampliació' }}
          </Button>
        </div>
        <p v-if="editingPackId === null" class="text-xs text-neutral-500">Afegir una ampliació a un projecte acabat/arxivat el reobre automàticament.</p>
      </Card>

      <!-- Tasks -->
      <Card title="Tasks">
        <table class="min-w-full divide-y divide-neutral-200 text-sm">
          <thead>
            <tr class="text-left text-xs uppercase text-neutral-500">
              <th class="py-2">Títol</th>
              <th>Estat</th>
              <th>Estimades</th>
              <th>Consumides</th>
              <th></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            <tr v-for="t in tasks" :key="t.id">
              <td class="py-2">{{ t.title }}</td>
              <td>
                <Badge :tone="taskStatusTone[t.status]">
                  {{ TASK_STATUS_LABELS[t.status] ?? t.status }}
                </Badge>
              </td>
              <td>{{ t.estimate_hours != null ? `${t.estimate_hours} h` : '—' }}</td>
              <td>{{ t.consumed_hours }} h</td>
              <td class="py-2">
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    @click="startEditTask(t)"
                    class="text-xs text-brand-600 hover:underline"
                  >Editar</button>
                  <button
                    type="button"
                    @click="taskToDelete = t"
                    class="text-xs text-danger-600 hover:underline"
                  >Eliminar</button>
                </div>
              </td>
            </tr>
            <tr v-if="tasks.length === 0">
              <td colspan="5" class="py-3 text-center text-neutral-500">Cap tasca encara.</td>
            </tr>
          </tbody>
        </table>

        <div v-if="editingTaskId !== null" class="flex items-center justify-between">
          <p class="text-sm font-medium text-neutral-700">Editant tasca #{{ editingTaskId }}</p>
          <button type="button" @click="cancelEditTask" class="text-xs text-neutral-600 hover:underline">Cancel·lar</button>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <TextField v-model="taskForm.title" label="Títol" />
          <SelectField v-model="taskForm.status" label="Estat" :options="taskStatusOptions" />
          <TextField v-model="taskForm.estimate_hours" label="Estimació (h)" />
        </div>
        <div class="flex justify-end">
          <Button
            type="button"
            variant="primary"
            :loading="loading"
            :disabled="!taskForm.title.trim()"
            @click="submitTask"
          >
            {{ editingTaskId !== null ? 'Desar tasca' : 'Afegir tasca' }}
          </Button>
        </div>
      </Card>

      <!-- Imputacions -->
      <Card title="Imputacions">
        <template #actions>
          <Button variant="primary" size="sm" @click="openQuickAdd">+ Imputar hores</Button>
        </template>
        <table class="min-w-full divide-y divide-neutral-200 text-sm">
          <thead>
            <tr class="text-left text-xs uppercase text-neutral-500">
              <th class="py-2">Data</th>
              <th>Tasca</th>
              <th>Minuts</th>
              <th>Descripció</th>
              <th></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            <tr
              v-for="e in (project.time_entries ?? []).slice().sort((a, b) => (a.worked_on ?? '').localeCompare(b.worked_on ?? ''))"
              :key="e.id"
            >
              <td class="py-2">{{ formatDate(e.worked_on, '—') }}</td>
              <td>{{ taskTitleById(e.task_id) }}</td>
              <td>{{ e.minutes }}</td>
              <td class="max-w-xs truncate">{{ e.description || '—' }}</td>
              <td class="py-2">
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    @click="openEditEntry(e)"
                    class="text-xs text-brand-600 hover:underline"
                  >Editar</button>
                  <button
                    type="button"
                    @click="entryToDelete = e"
                    class="text-xs text-danger-600 hover:underline"
                  >Eliminar</button>
                </div>
              </td>
            </tr>
            <tr v-if="(project.time_entries?.length ?? 0) === 0">
              <td colspan="5" class="py-3 text-center text-neutral-500">Cap imputació encara.</td>
            </tr>
          </tbody>
        </table>
      </Card>

      <!-- Dialogs confirm -->
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
        :open="taskToDelete !== null"
        title="Eliminar tasca"
        :message="`Estàs segur que vols eliminar la tasca «${taskToDelete?.title}»?`"
        danger
        confirm-label="Eliminar"
        @confirm="confirmDeleteTask"
        @cancel="taskToDelete = null"
      />
      <ConfirmDialog
        :open="entryToDelete !== null"
        title="Eliminar imputació"
        :message="`Estàs segur que vols eliminar la imputació del ${formatDate(entryToDelete?.worked_on, '—')}?`"
        danger
        confirm-label="Eliminar"
        @confirm="confirmDeleteEntry"
        @cancel="entryToDelete = null"
      />
      <ConfirmDialog
        :open="showDelete"
        title="Eliminar Projecte"
        message="Es farà soft-delete. Es pot recuperar via tinker si cal."
        danger
        @confirm="destroy"
        @cancel="showDelete = false"
      />

      <!-- Quick-add / edit imputació Modal -->
      <Modal :open="quickAddOpen" title="Imputar hores" @close="closeQuickAdd">
        <div class="space-y-3">
          <DateField v-model="qa.worked_on" label="Data" />
          <SelectField v-model="qa.task_id" label="Tasca (opcional)" :options="taskOptions" />
          <TextField
            v-model="qa.minutes"
            label="Minuts"
            :error="quickAddMinutesError ?? undefined"
          />
          <TextareaField v-model="qa.description" label="Descripció" :rows="3" />
          <div class="flex justify-end gap-3">
            <Button type="button" variant="secondary" @click="closeQuickAdd">Cancel·lar</Button>
            <Button type="button" variant="primary" :loading="loading" @click="submitQuickAdd">Desar</Button>
          </div>
        </div>
      </Modal>
    </template>
  </AppShell>
</template>
