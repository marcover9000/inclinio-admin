<script setup lang="ts">
import { useId } from 'vue';

defineProps<{
  modelValue: string;
  label: string;
  rows?: number;
  error?: string;
  placeholder?: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();

const id = useId();
</script>

<template>
  <div class="flex flex-col gap-1">
    <label :for="id" class="text-sm font-medium text-neutral-700">{{ label }}</label>
    <textarea
      :id="id"
      :value="modelValue"
      :rows="rows ?? 4"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      class="rounded border-neutral-300 focus:ring-2 focus:ring-brand-500"
    />
    <span v-if="error" class="text-sm text-danger-600">{{ error }}</span>
  </div>
</template>
