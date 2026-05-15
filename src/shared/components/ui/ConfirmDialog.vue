<script setup lang="ts">
defineProps<{
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}>();

defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="absolute inset-0 bg-black/30"
      @click="$emit('cancel')"
    ></div>
    <div class="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
      <h3 class="text-lg font-semibold">{{ title }}</h3>
      <p class="mt-2 text-sm text-neutral-600 whitespace-pre-wrap">{{ message }}</p>
      <div class="mt-6 flex justify-end gap-2">
        <button
          type="button"
          @click="$emit('cancel')"
          class="rounded border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-50"
        >
          {{ cancelLabel ?? 'Cancel·lar' }}
        </button>
        <button
          type="button"
          @click="$emit('confirm')"
          :class="[
            'rounded px-4 py-2 text-sm text-white',
            danger ? 'bg-danger-600 hover:bg-danger-700' : 'bg-brand-600 hover:bg-brand-700',
          ]"
        >
          {{ confirmLabel ?? 'Confirmar' }}
        </button>
      </div>
    </div>
  </div>
</template>
