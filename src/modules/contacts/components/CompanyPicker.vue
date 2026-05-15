<script setup lang="ts">
/*
 * Autocomplete d'empresa: input + dropdown de suggeriments.
 * v-model        → companyId (number | null)
 * v-model:name   → text mostrat a l'input
 * emit pick      → l'empresa escollida (per si el caller vol info extra, ex: is_client)
 *
 * Costura: la cerca està aïllada a `search()`. De moment es dispara per
 * keystroke (comportament actual); aquí s'hi afegirà debounce més endavant.
 */
import { ref, useId } from 'vue';
import { listCompanies } from '../api/companies';
import type { Company } from '../types';

const props = withDefaults(defineProps<{
  modelValue: number | null;
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}>(), {
  disabled: false,
});

const emit = defineEmits<{
  'update:modelValue': [v: number | null];
  'update:name': [v: string];
  pick: [company: Company];
}>();

const suggestions = ref<Company[]>([]);
const id = useId();

async function search() {
  if (!props.name) {
    suggestions.value = [];
    return;
  }
  const result = await listCompanies({ search: props.name });
  suggestions.value = result.data.slice(0, 5);
}

function onInput(e: Event) {
  emit('update:name', (e.target as HTMLInputElement).value);
  search();
}

function pick(company: Company) {
  emit('update:modelValue', company.id);
  emit('update:name', company.name);
  emit('pick', company);
  suggestions.value = [];
}

defineExpose({ search });
</script>

<template>
  <div class="relative">
    <label v-if="label" :for="id" class="block text-sm font-medium text-neutral-700 mb-1">{{ label }}</label>
    <input
      :id="id"
      :value="name"
      :placeholder="placeholder"
      :disabled="disabled"
      class="w-full rounded border-neutral-300 focus:ring-2 focus:ring-brand-500 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
      @input="onInput"
    />
    <ul v-if="suggestions.length" class="absolute z-10 mt-1 w-full rounded border bg-white shadow">
      <li
        v-for="c in suggestions"
        :key="c.id"
        @click="pick(c)"
        class="cursor-pointer p-2 text-sm hover:bg-neutral-100"
      >
        {{ c.name }}<span v-if="c.is_client" class="ml-2 text-xs text-success-600">(client)</span>
      </li>
    </ul>
  </div>
</template>
