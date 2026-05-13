<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue';

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
  <TransitionRoot :show="open" as="template">
    <Dialog @close="$emit('cancel')" class="relative z-50">
      <TransitionChild
        as="div"
        enter="ease-out duration-200"
        enter-from="opacity-0"
        enter-to="opacity-100"
        class="fixed inset-0 bg-black/30"
      />
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <DialogTitle class="text-lg font-semibold">{{ title }}</DialogTitle>
          <p class="mt-2 text-sm text-gray-600">{{ message }}</p>
          <div class="mt-6 flex justify-end gap-2">
            <button @click="$emit('cancel')" class="rounded border px-4 py-2 text-sm">
              {{ cancelLabel ?? 'Cancel·lar' }}
            </button>
            <button
              @click="$emit('confirm')"
              :class="[
                'rounded px-4 py-2 text-sm text-white',
                danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700',
              ]"
            >
              {{ confirmLabel ?? 'Confirmar' }}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
