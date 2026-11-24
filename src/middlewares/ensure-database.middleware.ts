import type { NextFunction, Request, Response } from 'express';
import { ensureDatabase } from '../config/database.js';
import { AppError } from '../errors/app-error.js';

// Garantiza una conexión activa antes de las rutas que usan MongoDB.
// El error original se descarta: puede contener la URI o el host del clúster.
export const requireDatabase = (
  _req: Request,
  _res: Response,
  next: NextFunction
): void => {
  ensureDatabase().then(
    () => next(),
    () => next(new AppError(
      'La base de datos no está disponible.',
      503,
      'DATABASE_UNAVAILABLE'
    ))
  );
};
