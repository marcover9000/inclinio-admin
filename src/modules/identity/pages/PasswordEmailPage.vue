<script setup lang="ts">
/*
 * Pàgina per sol·licitar un email de reset de contrasenya.
 * Sempre mostra missatge d'èxit (encara que l'email no existeixi)
 * per no revelar quins emails estan registrats.
 */
import { ref, reactive } from 'vue';
import { requestPasswordReset } from '@/modules/identity/api/auth';
import TextField from '@/shared/components/form/TextField.vue';
import SubmitButton from '@/shared/components/form/SubmitButton.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';

const form = reactive({ email: '' });
const errors = reactive<Record<string, string>>({});
const successMessage = ref<string | null>(null);
const globalError = ref<string | null>(null);
const loading = ref(false);

async function handleSubmit() {
  loading.value = true;
  globalError.value = null;
  Object.keys(errors).forEach((k) => delete errors[k]);
  try {
    const response = await requestPasswordReset(form.email);
    successMessage.value = response.message;
  } catch (err: any) {
    if (err.response?.status === 422) {
      const apiErrors = err.response.data?.errors ?? {};
      Object.keys(apiErrors).forEach((field) => {
        errors[field] = apiErrors[field][0];
      });
    } else {
      globalError.value = 'Error de connexió. Torna-ho a provar.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 px-4">
    <div class="w-full max-w-md bg-white rounded-lg shadow-md p-8 space-y-6">
      <div class="text-center space-y-1">
        <h1 class="text-2xl font-semibold text-slate-800">Inclinio v2</h1>
        <p class="text-sm text-slate-500">Recupera la contrasenya</p>
      </div>

      <AlertMessage v-if="globalError" variant="error" :message="globalError" />
      <AlertMessage v-if="successMessage" variant="success" :message="successMessage" />

      <form v-if="!successMessage" class="space-y-4" @submit.prevent="handleSubmit">
        <p class="text-sm text-slate-600">
          Introdueix el teu correu electrònic. Si està registrat, t'enviarem un enllaç per restablir la contrasenya.
        </p>
        <TextField
          v-model="form.email"
          label="Correu electrònic"
          type="email"
          autocomplete="email"
          required
          :error="errors.email"
        />
        <SubmitButton :loading="loading" label="Enviar enllaç" :block="true" />
      </form>

      <div class="text-center text-sm">
        <RouterLink to="/login" class="text-slate-600 hover:text-slate-800 underline">
          Tornar al login
        </RouterLink>
      </div>
    </div>
  </div>
</template>
