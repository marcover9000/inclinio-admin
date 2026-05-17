<script setup lang="ts">
/*
 * Pàgina per establir nova contrasenya.
 * Llegeix `:token` del path i `?email=` de la query.
 * En èxit, redirigeix a /login amb missatge.
 */
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { resetPassword } from '@/modules/identity/api/auth';
import PasswordField from '@/shared/components/form/PasswordField.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import Button from '@/shared/components/ui/Button.vue';
import Card from '@/shared/components/ui/Card.vue';

const route = useRoute();
const router = useRouter();

const rawToken = route.params.token;
const token = Array.isArray(rawToken) ? rawToken[0] : rawToken ?? '';

const rawEmail = route.query.email;
const email = Array.isArray(rawEmail) ? (rawEmail[0] ?? '') : rawEmail ?? '';

// Si el token o l'email no estan presents, l'enllaç és invàlid: tornem al formulari inicial.
if (!token || !email) {
  router.replace('/password/email');
}

const form = reactive({
  password: '',
  password_confirmation: '',
});

const errors = reactive<Record<string, string>>({});
const globalError = ref<string | null>(null);
const loading = ref(false);

async function handleSubmit() {
  loading.value = true;
  globalError.value = null;
  Object.keys(errors).forEach((k) => delete errors[k]);

  try {
    await resetPassword({
      email,
      token,
      password: form.password,
      password_confirmation: form.password_confirmation,
    });
    router.push({ path: '/login', query: { reset: 'success' } });
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
  <div class="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
    <div class="w-full max-w-md">
      <Card>
        <div class="text-center space-y-1">
          <h1 class="text-2xl font-semibold text-neutral-800">Inclinio v2</h1>
          <p class="text-sm text-neutral-500">Estableix una nova contrasenya</p>
        </div>

        <AlertMessage v-if="globalError" variant="error" :message="globalError" />

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <p class="text-sm text-neutral-600">
            Restablint contrasenya per a <strong>{{ email }}</strong>.
          </p>
          <PasswordField
            v-model="form.password"
            label="Nova contrasenya"
            autocomplete="new-password"
            required
            :error="errors.password"
          />
          <PasswordField
            v-model="form.password_confirmation"
            label="Confirmar contrasenya"
            autocomplete="new-password"
            required
          />
          <Button type="submit" variant="primary" :loading="loading" :block="true">Restablir contrasenya</Button>
        </form>
      </Card>
    </div>
  </div>
</template>
