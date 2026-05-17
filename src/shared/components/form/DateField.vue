<script setup lang="ts">
import { useId } from 'vue';

/*
 * Camp de data natiu (<input type="date">) amb label i restriccions
 * opcionals min/max (ISO AAAA-MM-DD). Mateix patró visual que TextField.
 */
defineProps<{
  modelValue: string;
  label: string;
  min?: string;
  max?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();

const id = useId();
</script>

<template>
  <div class="space-y-1">
    <label :for="id" class="block text-sm font-medium text-neutral-700">
      {{ label }}<span v-if="required" class="text-danger-500"> *</span>
    </label>
    <input
      :id="id"
      type="date"
      :value="modelValue"
      :min="min"
      :max="max"
      :required="required"
      :disabled="disabled"
      class="w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
      :class="{ 'border-danger-500': error }"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="text-sm text-danger-600">{{ error }}</p>
  </div>
</template>
