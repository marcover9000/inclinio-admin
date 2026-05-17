<script setup lang="ts">
import Modal from './Modal.vue';

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
  <Modal :open="open" :title="title" @close="$emit('cancel')">
    <p class="text-sm text-neutral-600 whitespace-pre-wrap">{{ message }}</p>
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
  </Modal>
</template>
