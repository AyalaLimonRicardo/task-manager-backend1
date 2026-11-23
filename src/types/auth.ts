import type { User, UserRole } from '../models/user.js';

export const MIN_PASSWORD_CHARACTERS = 15;
export const MAX_PASSWORD_BYTES = 72;

// La contraseña existe solo durante la solicitud; no es un modelo persistente.
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterResult {
  user: User;
}

export interface LoginResult {
  user: User;
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
}

// Resultado interno de verificar un JWT; se usa en A10.
export interface AccessTokenSubject {
  userId: string;
  role: UserRole;
}
