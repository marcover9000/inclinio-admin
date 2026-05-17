<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { listProjects, convertLeadToProject } from '../api/projects';
import type { Project } from '../types';
import type { Lead } from '@/modules/crm/types';
import { useAsyncAction } from '@/shared/composables/useAsyncAction';
import { emptyPackState, buildPackPayload, packIsValid } from '../pack';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import SubmitButton from '@/shared/components/form/SubmitButton.vue';
import TextField from '@/shared/components/form/TextField.vue';
import PackFields from './PackFields.vue';

/*
 * Conversió Lead 'won' → Projecte. Recomana (no bloqueja): si el client
 * del lead ja té projectes, proposa una ampliació al més recent; si no,
 * un projecte nou. L'avís de "mateix client" és informatiu (spec §5b).
 */
const props = defineProps<{ lead: Lead }>();
const router = useRouter();

const mode = ref<'new' | 'extend'>('new');
const newName = ref('');
const targetProjectId = ref<number | null>(null);
const clientProjects = ref<Project[]>([]);
const recommendation = ref<string>('');

const packState = ref(emptyPackState('Venda inicial'));

const { run, loading, errorMsg } = useAsyncAction();

const clientLabel = computed(
  () => props.lead.company?.name ?? props.lead.person?.full_name ?? 'aquest client',
);

const canSubmit = computed(() =>
  packIsValid(packState.value)
  && (mode.value === 'new' ? newName.value.trim().length > 0 : targetProjectId.value !== null),
);

onMounted(async () => {
  newName.value = `Projecte ${clientLabel.value}`;
  try {
    const companyId = props.lead.company?.id;
    const personId = props.lead.person?.id;
    const res = await listProjects(
      companyId ? { client_company_id: companyId } : { client_person_id: personId },
    );
    clientProjects.value = res.data;
    if (clientProjects.value.length > 0) {
      mode.value = 'extend';
      targetProjectId.value = clientProjects.value[0].id;
      recommendation.value = `${clientLabel.value} ja té ${clientProjects.value.length} projecte(s). Recomano afegir aquesta venda com a ampliació al més recent ("${clientProjects.value[0].name}"). Pots crear-ne un de nou si ho prefereixes.`;
    } else {
      recommendation.value = `${clientLabel.value} no té cap projecte encara. Recomano crear-ne un de nou.`;
    }
  } catch {
    recommendation.value = 'No s\'han pogut carregar els projectes del client; pots crear-ne un de nou igualment.';
  }
});

function convert() {
  return run(async () => {
    const project = await convertLeadToProject(props.lead.id, {
      mode: mode.value,
      name: mode.value === 'new' ? newName.value.trim() : undefined,
      project_id: mode.value === 'extend' ? targetProjectId.value! : undefined,
      pack: buildPackPayload(packState.value),
    });
    router.push(`/projects/${project.id}`);
  }, 'No s\'ha pogut convertir el lead a projecte.');
}
</script>

<template>
  <section class="rounded border border-success-200 bg-success-50 p-4">
    <h2 class="mb-1 text-lg font-medium text-success-800">Convertir a projecte</h2>
    <p class="mb-3 text-sm text-success-800">{{ recommendation }}</p>

    <AlertMessage v-if="errorMsg" variant="error" :message="errorMsg" />

    <div class="flex gap-4 text-sm">
      <label class="flex items-center gap-1">
        <input type="radio" value="new" v-model="mode" /> Projecte nou
      </label>
      <label class="flex items-center gap-1" :class="{ 'opacity-50': clientProjects.length === 0 }">
        <input type="radio" value="extend" v-model="mode" :disabled="clientProjects.length === 0" />
        Ampliació a un projecte existent
      </label>
    </div>

    <div class="mt-3">
      <TextField v-if="mode === 'new'" v-model="newName" label="Nom del projecte" />
      <div v-else class="flex flex-col gap-1">
        <label class="text-sm font-medium text-neutral-700">Projecte a ampliar</label>
        <select v-model="targetProjectId" class="rounded border border-neutral-300 text-sm">
          <option v-for="p in clientProjects" :key="p.id" :value="p.id">
            {{ p.name }} ({{ p.status_label }})
          </option>
        </select>
      </div>
    </div>

    <PackFields class="mt-3" v-model="packState" />

    <SubmitButton class="mt-4" :loading="loading" :disabled="!canSubmit" @click="convert">
      {{ mode === 'new' ? 'Crear projecte des del lead' : 'Afegir ampliació des del lead' }}
    </SubmitButton>
  </section>
</template>
