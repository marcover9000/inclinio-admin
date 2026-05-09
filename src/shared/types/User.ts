/*
 * Forma canònica d'un usuari al frontend.
 * Coincideix amb el que retorna UserResource al backend.
 */
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'staff';
}
