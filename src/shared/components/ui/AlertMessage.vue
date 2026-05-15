<script setup lang="ts">
/*
 * Banner d'alerta. variant: 'success' | 'error' | 'info'.
 */
type AlertVariant = 'success' | 'error' | 'info';

defineProps<{
  variant: AlertVariant;
  message: string;
}>();

const variantClasses: Record<AlertVariant, string> = {
  success: 'bg-success-50 text-success-800 border-success-200',
  error: 'bg-danger-50 text-danger-800 border-danger-200',
  info: 'bg-brand-50 text-brand-800 border-brand-200',
};
</script>

<template>
  <div class="rounded-md border px-4 py-3 text-sm" :class="variantClasses[variant]">
    {{ message }}
  </div>
</template>
