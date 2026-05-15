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
    <label :for="id" class="text-sm font-medium text-gray-700">{{ label }}</label>
    <textarea
      :id="id"
      :value="modelValue"
      :rows="rows ?? 4"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      class="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
    />
    <span v-if="error" class="text-sm text-red-600">{{ error }}</span>
  </div>
</template>
