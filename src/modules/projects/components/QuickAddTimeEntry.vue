<script setup lang="ts">
import { ref, watch } from 'vue';
import Modal from '@/shared/components/ui/Modal.vue';
import Button from '@/shared/components/ui/Button.vue';
import DateField from '@/shared/components/form/DateField.vue';
import SelectField from '@/shared/components/form/SelectField.vue';
import TextField from '@/shared/components/form/TextField.vue';
import TextareaField from '@/shared/components/form/TextareaField.vue';
import { useAsyncAction } from '@/shared/composables/useAsyncAction';
import { listProjects, getProject, createTimeEntry, updateTimeEntry } from '../api/projects';
import type { Project, TimeEntry } from '../types';

const props = defineProps<{
  open: boolean;
  projectId?: number | null;
  tasks?: { id: number; title: string }[];
  editing?: TimeEntry | null;
  lastEntry?: TimeEntry | null;
}>();
const emit = defineEmits<{ close: []; saved: [project: Project] }>();

const { run, loading, errorMsg } = useAsyncAction();

const form = ref({ project_id: '' as number | '', worked_on: '', task_id: '' as number | '', minutes: '60', description: '' });
const minutesError = ref<string | null>(null);
const projectOptions = ref<{ value: number | string; label: string }[]>([]);
const taskOptions = ref<{ value: number | string; label: string }[]>([{ value: '', label: '(sense tasca)' }]);

function setTaskOptions(list: { id: number; title: string }[]) {
  taskOptions.value = [{ value: '', label: '(sense tasca)' }, ...list.map((t) => ({ value: t.id, label: t.title }))];
}

async function loadProjectPicker() {
  if (props.projectId != null) return;
  const page = await listProjects({});
  projectOptions.value = page.data.map((p) => ({ value: p.id, label: p.name }));
}

watch(() => form.value.project_id, async (pid) => {
  if (props.projectId != null) return;
  if (pid === '' ) { setTaskOptions([]); return; }
  const proj = await getProject(Number(pid));
  setTaskOptions(proj.tasks ?? []);
});

watch(() => props.open, async (open) => {
  if (!open) return;
  minutesError.value = null;
  await loadProjectPicker();
  if (props.projectId != null) setTaskOptions(props.tasks ?? []);
  if (props.editing) {
    const e = props.editing;
    form.value = {
      project_id: props.projectId ?? e.project_id,
      worked_on: e.worked_on ?? new Date().toISOString().slice(0, 10),
      task_id: e.task_id ?? '',
      minutes: String(e.minutes),
      description: e.description ?? '',
    };
  } else {
    const last = props.lastEntry ?? null;
    form.value = {
      project_id: props.projectId ?? '',
      worked_on: last?.worked_on ?? new Date().toISOString().slice(0, 10),
      task_id: last?.task_id != null ? last.task_id : '',
      minutes: last ? String(last.minutes) : '60',
      description: '',
    };
  }
}, { immediate: true });

function submit() {
  const mins = Number(form.value.minutes);
  if (!(mins > 0) || mins % 15 !== 0) {
    minutesError.value = 'Els minuts han de ser > 0 i múltiples de 15.';
    return;
  }
  minutesError.value = null;
  const pid = props.projectId ?? Number(form.value.project_id);
  if (!pid) { minutesError.value = 'Cal triar un projecte.'; return; }
  const payload = {
    worked_on: form.value.worked_on,
    minutes: mins,
    description: form.value.description,
    task_id: form.value.task_id === '' ? null : Number(form.value.task_id),
  };
  return run(async () => {
    const project = props.editing
      ? await updateTimeEntry(pid, props.editing.id, payload)
      : await createTimeEntry(pid, payload);
    emit('saved', project);
  }, 'No s\'ha pogut desar la imputació.');
}
</script>

<template>
  <Modal :open="open" title="Imputar hores" @close="emit('close')">
    <div class="space-y-3">
      <SelectField
        v-if="projectId == null"
        v-model="form.project_id"
        label="Projecte"
        :options="projectOptions"
      />
      <DateField v-model="form.worked_on" label="Data" />
      <SelectField v-model="form.task_id" label="Tasca (opcional)" :options="taskOptions" />
      <TextField v-model="form.minutes" label="Minuts (múltiples de 15)" :error="minutesError ?? undefined" />
      <TextareaField v-model="form.description" label="Descripció" :rows="3" />
      <p v-if="errorMsg" class="text-sm text-danger-600">{{ errorMsg }}</p>
      <div class="flex justify-end gap-2">
        <Button type="button" variant="secondary" @click="emit('close')">Cancel·lar</Button>
        <Button type="button" variant="primary" :loading="loading" @click="submit">Desar</Button>
      </div>
    </div>
  </Modal>
</template>
