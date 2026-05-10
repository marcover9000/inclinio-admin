<script setup lang="ts">
/*
 * Camp de text amb label, validació visual i missatge d'error opcional.
 * v-model lligat al valor.
 */
defineProps<{
  modelValue: string;
  label: string;
  type?: 'text' | 'email';
  error?: string;
  required?: boolean;
  autocomplete?: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <div class="space-y-1">
    <label class="block text-sm font-medium text-slate-700">
      {{ label }}<span v-if="required" class="text-red-500"> *</span>
    </label>
    <input
      :type="type ?? 'text'"
      :value="modelValue"
      :autocomplete="autocomplete"
      :required="required"
      class="w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
      :class="{ 'border-red-500': error }"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
  </div>
</template>
