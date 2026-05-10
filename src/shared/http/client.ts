/*
 * Client HTTP global. Configurat per enviar cookies (Sanctum)
 * en totes les peticions cap a inclinio-api.
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
