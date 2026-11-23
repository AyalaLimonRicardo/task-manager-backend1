import type { AccessTokenSubject } from './auth.js';

declare global {
  namespace Express {
    interface Locals {
      // Opcional: las rutas públicas no ejecutan authenticate.
      auth?: AccessTokenSubject;
    }
  }
}

export {};
