<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue';

/*
 * DateField — selector de data amb format VISIBLE dd/mm/aaaa SEMPRE
 * (independent del locale del navegador). El valor (v-model) és sempre
 * ISO 'AAAA-MM-DD' (o '' si buit) per a l'API i comparacions de rang.
 * Sense dependències externes. Mateix patró visual que TextField.
 */
const props = withDefaults(defineProps<{
  modelValue: string;
  label: string;
  min?: string;
  max?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}>(), {
  min: undefined,
  max: undefined,
  error: undefined,
  required: false,
  disabled: false,
});

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const id = useId();
const open = ref(false);
const root = ref<HTMLElement | null>(null);

const MONTHS = ['gener', 'febrer', 'març', 'abril', 'maig', 'juny', 'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre'];
const WEEKDAYS = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function isoParts(iso: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
}

function isoOf(y: number, m: number, d: number): string {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

const displayValue = computed(() => {
  const p = isoParts(props.modelValue);
  return p ? `${pad2(p.d)}/${pad2(p.m)}/${p.y}` : '';
});

const today = (() => {
  const n = new Date();
  return isoOf(n.getFullYear(), n.getMonth() + 1, n.getDate());
})();

const viewYear = ref(0);
const viewMonth = ref(0); // 1-12

function resetView(): void {
  const p = isoParts(props.modelValue) ?? isoParts(today)!;
  viewYear.value = p.y;
  viewMonth.value = p.m;
}
resetView();
watch(() => props.modelValue, () => {
  if (!open.value) resetView();
});

const grid = computed(() => {
  const y = viewYear.value;
  const m = viewMonth.value;
  const daysInMonth = new Date(y, m, 0).getDate();
  const firstDow = (new Date(y, m - 1, 1).getDay() + 6) % 7; // dilluns = 0
  const cells: Array<{ day: number; iso: string; disabled: boolean } | null> = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = isoOf(y, m, d);
    const disabled = (!!props.min && iso < props.min) || (!!props.max && iso > props.max);
    cells.push({ day: d, iso, disabled });
  }
  return cells;
});

function toggle(): void {
  if (props.disabled) return;
  open.value = !open.value;
  if (open.value) resetView();
}

function prevMonth(): void {
  if (viewMonth.value === 1) {
    viewMonth.value = 12;
    viewYear.value -= 1;
  } else {
    viewMonth.value -= 1;
  }
}

function nextMonth(): void {
  if (viewMonth.value === 12) {
    viewMonth.value = 1;
    viewYear.value += 1;
  } else {
    viewMonth.value += 1;
  }
}

function pick(iso: string): void {
  emit('update:modelValue', iso);
  open.value = false;
}

function clear(): void {
  emit('update:modelValue', '');
  open.value = false;
}

function onDocPointer(e: MouseEvent): void {
  if (open.value && root.value && !root.value.contains(e.target as Node)) {
    open.value = false;
  }
}

function onKey(e: KeyboardEvent): void {
  if (e.key === 'Escape') open.value = false;
}

window.addEventListener('mousedown', onDocPointer);
window.addEventListener('keydown', onKey);
onBeforeUnmount(() => {
  window.removeEventListener('mousedown', onDocPointer);
  window.removeEventListener('keydown', onKey);
});
</script>

<template>
  <div ref="root" class="relative space-y-1">
    <label :for="id" class="block text-sm font-medium text-neutral-700">
      {{ label }}<span v-if="required" class="text-danger-500"> *</span>
    </label>

    <button
      :id="id"
      type="button"
      :disabled="disabled"
      @click="toggle"
      class="flex w-full items-center justify-between rounded-md border border-neutral-300 px-3 py-2 text-left shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500"
      :class="{ 'border-danger-500': error }"
    >
      <span :class="displayValue ? 'text-neutral-800' : 'text-neutral-500'">
        {{ displayValue || 'dd/mm/aaaa' }}
      </span>
      <span class="flex items-center gap-2">
        <span
          v-if="displayValue && !required && !disabled"
          role="button"
          aria-label="Esborrar data"
          class="text-neutral-500 hover:text-neutral-700"
          @click.stop="clear"
        >✕</span>
        <span class="text-neutral-500" aria-hidden="true">📅</span>
      </span>
    </button>

    <div
      v-if="open"
      class="absolute z-20 mt-1 w-72 rounded-md border border-neutral-200 bg-white p-3 shadow-lg"
    >
      <div class="mb-2 flex items-center justify-between">
        <button type="button" class="rounded px-2 py-1 text-neutral-600 hover:bg-neutral-100" @click="prevMonth">‹</button>
        <span class="text-sm font-medium text-neutral-800">{{ MONTHS[viewMonth - 1] }} {{ viewYear }}</span>
        <button type="button" class="rounded px-2 py-1 text-neutral-600 hover:bg-neutral-100" @click="nextMonth">›</button>
      </div>
      <div class="grid grid-cols-7 gap-1 text-center text-xs text-neutral-500">
        <span v-for="w in WEEKDAYS" :key="w" class="py-1">{{ w }}</span>
      </div>
      <div class="grid grid-cols-7 gap-1">
        <template v-for="(cell, i) in grid" :key="i">
          <span v-if="cell === null" />
          <button
            v-else
            type="button"
            :disabled="cell.disabled"
            class="rounded py-1 text-sm text-neutral-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent"
            :class="{
              'bg-brand-600 text-white hover:bg-brand-600': cell.iso === modelValue,
              'ring-1 ring-brand-500': cell.iso === today && cell.iso !== modelValue,
            }"
            @click="pick(cell.iso)"
          >{{ cell.day }}</button>
        </template>
      </div>
    </div>

    <p v-if="error" class="text-sm text-danger-600">{{ error }}</p>
  </div>
</template>
