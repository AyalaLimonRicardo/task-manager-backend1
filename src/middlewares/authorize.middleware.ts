import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { AppError } from '../errors/app-error.js';
import type { UserRole } from '../models/user.js';

// Fábrica: cada ruta declara qué roles acepta, p. ej. requireRole('admin').
// Se ejecuta después de authenticate y solo lee el rol firmado en el JWT (no consulta MongoDB).
export const requireRole = (...allowedRoles: UserRole[]): RequestHandler => (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  const auth = res.locals.auth;
  if (!auth) {
    // Sin identidad: falta autenticación (401), no permiso.
    next(new AppError(
      'No existe una identidad autenticada en la solicitud.',
      401,
      'AUTHENTICATION_REQUIRED'
    ));
    return;
  }
  if (!allowedRoles.includes(auth.role)) {
    // Identidad válida pero sin permiso: 403.
    next(new AppError(
      'No tienes permiso para realizar esta operación.',
      403,
      'FORBIDDEN'
    ));
    return;
  }
  next();
};
