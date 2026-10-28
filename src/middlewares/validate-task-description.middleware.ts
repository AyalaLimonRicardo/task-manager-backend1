import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';

export const MAX_DESCRIPTION_LENGTH = 300;

// description es opcional: si no viene, la tarea sigue siendo válida.
export const validateTaskDescription = (req: Request, res: Response, next: NextFunction): void => {
  const description: unknown = req.body?.description;

  if (description === undefined || description === null) {
    next();
    return;
  }

  if (typeof description !== 'string') {
    next(new AppError('El campo description no es válido.', 422, 'VALIDATION_ERROR', [
      { field: 'description', message: 'description debe ser texto.' }
    ]));
    return;
  }

  const cleanDescription = description.trim();

  if (cleanDescription.length > MAX_DESCRIPTION_LENGTH) {
    next(new AppError('El campo description es demasiado largo.', 422, 'VALIDATION_ERROR', [
      { field: 'description', message: `description no debe superar ${MAX_DESCRIPTION_LENGTH} caracteres.` }
    ]));
    return;
  }

  if (cleanDescription) {
    res.locals.taskDescription = cleanDescription;
  }
  next();
};
