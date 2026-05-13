<script setup lang="ts">
import { ref } from 'vue';
import TextareaField from '@/shared/components/form/TextareaField.vue';
import SubmitButton from '@/shared/components/form/SubmitButton.vue';

const emit = defineEmits<{ submit: [body: string] }>();

const body = ref('');
const loading = ref(false);

async function onSubmit() {
  if (!body.value.trim()) return;
  loading.value = true;
  emit('submit', body.value);
  body.value = '';
  loading.value = false;
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-2">
    <TextareaField v-model="body" label="Afegir nota" placeholder="Anota un avenç, una idea, un acord…" />
    <SubmitButton :loading="loading" :disabled="!body.trim()" :block="true">Afegir</SubmitButton>
  </form>
</template>
