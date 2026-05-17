<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{ title?: string; as?: 'section' | 'fieldset' }>(),
  { as: 'section' },
);

const titleTag = computed(() => (props.as === 'fieldset' ? 'legend' : 'h2'));
</script>

<template>
  <component :is="as" class="space-y-3 rounded-lg border border-neutral-200 p-4">
    <div v-if="title || $slots.actions" class="flex items-center justify-between">
      <component :is="titleTag" class="text-lg font-medium">{{ title }}</component>
      <div v-if="$slots.actions"><slot name="actions" /></div>
    </div>
    <slot />
  </component>
</template>
