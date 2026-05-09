/*
 * Wrappers tipats per a tots els endpoints d'autenticació.
 * Aïllen els components dels detalls d'Axios.
 */
import { http } from '@/shared/http/client';
import type { User } from '@/shared/types/User';

interface ApiResponse<T> {
  data: T;
}

interface MessageResponse {
  message: string;
}

/** Obté la cookie XSRF necessària abans de qualsevol POST a Sanctum. */
async function getCsrfCookie(): Promise<void> {
  await http.get('/sanctum/csrf-cookie');
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

/** Login: obté CSRF, fa POST /login, retorna l'usuari autenticat. */
export async function login(credentials: LoginCredentials): Promise<User> {
  await getCsrfCookie();
  const { data } = await http.post<ApiResponse<User>>('/login', credentials);
  return data.data;
}

/** Logout: invalida la sessió al servidor. */
export async function logout(): Promise<void> {
  await http.post('/logout');
}

/** Obté l'usuari actual o null si no autenticat. Captura 401 silenciosament. */
export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const { data } = await http.get<ApiResponse<User>>('/api/me');
    return data.data;
  } catch (err: any) {
    if (err.response?.status === 401) return null;
    throw err;
  }
}

/** Sol·licita un email de reset de contrasenya. */
export async function requestPasswordReset(email: string): Promise<MessageResponse> {
  await getCsrfCookie();
  const { data } = await http.post<MessageResponse>('/password/email', { email });
  return data;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

/** Aplica una nova contrasenya amb el token rebut per email. */
export async function resetPassword(payload: ResetPasswordPayload): Promise<MessageResponse> {
  await getCsrfCookie();
  const { data } = await http.post<MessageResponse>('/password/reset', payload);
  return data;
}
