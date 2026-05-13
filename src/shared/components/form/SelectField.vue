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
  <div class="flex flex-col gap-1">
    <label :for="id" class="text-sm font-medium text-gray-700">{{ label }}</label>
    <select
      :id="id"
      :value="modelValue ?? ''"
      :disabled="disabled"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      class="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
    <span v-if="error" class="text-sm text-red-600">{{ error }}</span>
  </div>
</template>
