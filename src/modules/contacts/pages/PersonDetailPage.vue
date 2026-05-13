<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getPerson, updatePerson, deletePerson } from '../api/people';
import type { Person } from '../types';
import AppShell from '@/shared/components/AppShell.vue';
import TextField from '@/shared/components/form/TextField.vue';
import SubmitButton from '@/shared/components/form/SubmitButton.vue';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import ClientBadge from '../components/ClientBadge.vue';

const route = useRoute();
const router = useRouter();
const person = ref<Person | null>(null);
const loading = ref(false);
const errorMsg = ref<string | null>(null);
const showDelete = ref(false);

async function load() {
  person.value = await getPerson(Number(route.params.id));
}

async function save() {
  if (!person.value) return;
  loading.value = true;
  errorMsg.value = null;
  try {
    person.value = await updatePerson(person.value.id, {
      first_name: person.value.first_name,
      last_name: person.value.last_name,
      email: person.value.email,
      phone: person.value.phone,
      position: person.value.position,
    });
  } catch (e: any) {
    errorMsg.value = e?.response?.data?.message ?? 'No s\'han pogut desar els canvis.';
    console.error(e);
  } finally {
    loading.value = false;
  }
}

async function destroy() {
  if (!person.value) return;
  await deletePerson(person.value.id);
  router.push('/people');
}

onMounted(load);
</script>

<template>
  <AppShell>
    <div class="space-y-4 p-6" v-if="person">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">{{ person.full_name }}</h1>
        <ClientBadge v-if="person.is_client" :since="person.became_client_at" />
      </div>
      <AlertMessage v-if="errorMsg" variant="error" :message="errorMsg" />
      <form @submit.prevent="save" class="grid grid-cols-2 gap-4">
        <TextField v-model="person.first_name" label="Nom" />
        <TextField :model-value="person.last_name ?? ''" @update:model-value="v => person!.last_name = v" label="Cognoms" />
        <TextField :model-value="person.email ?? ''" @update:model-value="v => person!.email = v" label="Email" />
        <TextField :model-value="person.phone ?? ''" @update:model-value="v => person!.phone = v" label="Telèfon" />
        <TextField :model-value="person.position ?? ''" @update:model-value="v => person!.position = v" label="Càrrec" />
        <div class="col-span-2 flex justify-between">
          <SubmitButton :loading="loading">Desar canvis</SubmitButton>
          <button type="button" @click="showDelete = true" class="text-sm text-red-600 hover:underline">Eliminar</button>
        </div>
      </form>
      <ConfirmDialog
        :open="showDelete"
        title="Eliminar persona"
        :message="`Estàs segur que vols eliminar ${person.full_name}? (soft-delete)`"
        danger
        @confirm="destroy"
        @cancel="showDelete = false"
      />
    </div>
  </AppShell>
</template>
