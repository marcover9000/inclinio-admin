/*
 * Client HTTP global. Configurat per enviar cookies (Sanctum)
 * en totes les peticions cap a inclinio-api.
 *
 * Interceptor: si una resposta retorna 401 (sessió expirada o invalidada)
 * i no estem ja a /login, neteja l'estat d'auth i redirigeix.
 */
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://api.inclinio.localhost';

export const http = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  // A partir d'axios 1.6, l'auto-attach del header X-XSRF-TOKEN per a peticions
  // cross-origin requereix aquesta opció explícita (admin.* → api.*).
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      const onAuthPage = window.location.pathname.startsWith('/login')
        || window.location.pathname.startsWith('/password');
      if (!onAuthPage) {
        const { useAuthStore } = await import('@/shared/stores/auth');
        const auth = useAuthStore();
        auth.user = null;
        const redirect = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?redirect=${redirect}`;
      }
    }
    return Promise.reject(error);
  },
);
