<script setup lang="ts">
import { useId } from 'vue';

defineProps<{
  modelValue: string | number | null;
  label: string;
  options: Array<{ value: string | number; label: string }>;
  error?: string;
  disabled?: boolean;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();

const id = useId();
</script>

<template>
  <div class="space-y-1">
    <label :for="id" class="block text-sm font-medium text-neutral-700">{{ label }}</label>
    <select
      :id="id"
      :value="modelValue ?? ''"
      :disabled="disabled"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      class="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
      :class="{ 'border-danger-500': error }"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
    <p v-if="error" class="text-sm text-danger-600">{{ error }}</p>
  </div>
</template>
