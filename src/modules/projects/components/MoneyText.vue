<script setup lang="ts">
import type { Money } from '../types';

/* Mostra un Money serialitzat (o un guió si és null). */
defineProps<{ money: Money | null | undefined }>();
</script>

<template>
  <span>{{ money ? money.formatted : '—' }}</span>
</template>
