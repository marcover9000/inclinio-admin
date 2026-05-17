<script setup lang="ts">
import { ref } from 'vue';
import TextareaField from '@/shared/components/form/TextareaField.vue';
import Button from '@/shared/components/ui/Button.vue';

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
    <div class="flex justify-end">
      <Button type="submit" variant="primary" :loading="loading" :disabled="!body.trim()">Afegir</Button>
    </div>
  </form>
</template>
