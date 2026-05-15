<script setup lang="ts">
/*
 * Camp de contrasenya amb toggle de visibilitat.
 * Comportament idèntic a TextField però amb type=password/text dinàmic.
 */
import { ref, useId } from 'vue';

defineProps<{
  modelValue: string;
  label: string;
  error?: string;
  required?: boolean;
  autocomplete?: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();

const id = useId();
const visible = ref(false);
</script>

<template>
  <div class="space-y-1">
    <label :for="id" class="block text-sm font-medium text-neutral-700">
      {{ label }}<span v-if="required" class="text-danger-500"> *</span>
    </label>
    <div class="relative">
      <input
        :id="id"
        :type="visible ? 'text' : 'password'"
        :value="modelValue"
        :autocomplete="autocomplete"
        :required="required"
        class="w-full rounded-md border border-neutral-300 px-3 py-2 pr-10 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        :class="{ 'border-danger-500': error }"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        type="button"
        class="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500 hover:text-neutral-700"
        :aria-label="visible ? 'Ocultar contrasenya' : 'Mostrar contrasenya'"
        @click="visible = !visible"
      >
        {{ visible ? '🙈' : '👁️' }}
      </button>
    </div>
    <p v-if="error" class="text-sm text-danger-600">{{ error }}</p>
  </div>
</template>
