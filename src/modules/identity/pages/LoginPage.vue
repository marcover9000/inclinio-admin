<script setup lang="ts">
/*
 * Pàgina de login. Form amb email + contrasenya + recordar-me.
 * En èxit, navega a /dashboard.
 * Mostra errors de validació camp a camp + missatge global si falla auth.
 */
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/shared/stores/auth';
import TextField from '@/shared/components/form/TextField.vue';
import PasswordField from '@/shared/components/form/PasswordField.vue';
import AlertMessage from '@/shared/components/ui/AlertMessage.vue';
import Button from '@/shared/components/ui/Button.vue';
import Card from '@/shared/components/ui/Card.vue';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const resetSuccess = route.query.reset === 'success';

const form = reactive({
  email: '',
  password: '',
  remember: false,
});

const errors = reactive<Record<string, string>>({});
const globalError = ref<string | null>(null);
const loading = ref(false);

async function handleSubmit() {
  loading.value = true;
  globalError.value = null;
  Object.keys(errors).forEach((k) => delete errors[k]);

  try {
    await auth.login(form);
    const raw = route.query.redirect;
    const redirect = typeof raw === 'string' && raw.startsWith('/') ? raw : '/dashboard';
    router.push(redirect);
  } catch (err: any) {
    if (err.response?.status === 422) {
      const apiErrors = err.response.data?.errors ?? {};
      Object.keys(apiErrors).forEach((field) => {
        errors[field] = apiErrors[field][0];
      });
    } else if (err.response?.status === 429) {
      globalError.value = 'Massa intents. Torna a provar més tard.';
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
          <p class="text-sm text-neutral-500">Inicia sessió</p>
        </div>

        <AlertMessage v-if="globalError" variant="error" :message="globalError" />
        <AlertMessage
          v-if="resetSuccess"
          variant="success"
          message="Contrasenya restablerta correctament. Ja pots iniciar sessió."
        />

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <TextField
            v-model="form.email"
            label="Correu electrònic"
            type="email"
            autocomplete="email"
            required
            :error="errors.email"
          />
          <PasswordField
            v-model="form.password"
            label="Contrasenya"
            autocomplete="current-password"
            required
            :error="errors.password"
          />
          <label class="flex items-center gap-2 text-sm text-neutral-600">
            <input v-model="form.remember" type="checkbox" class="rounded border-neutral-300" />
            Recorda'm
          </label>
          <Button type="submit" variant="primary" :loading="loading" :block="true">Entra</Button>
        </form>

        <div class="text-center text-sm">
          <RouterLink to="/password/email" class="text-neutral-600 hover:text-neutral-800 underline">
            He oblidat la contrasenya
          </RouterLink>
        </div>
      </Card>
    </div>
  </div>
</template>
