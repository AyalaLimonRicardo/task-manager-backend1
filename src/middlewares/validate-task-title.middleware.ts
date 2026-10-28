import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';

export const MAX_TITLE_LENGTH = 120;

export const validateTaskTitle = (req: Request, res: Response, next: NextFunction): void => {
  const title: unknown = req.body?.title;

  if (typeof title !== 'string' || !title.trim()) {
    next(new AppError('El campo title es obligatorio.', 422, 'VALIDATION_ERROR', [
      { field: 'title', message: 'title debe ser un texto no vacío.' }
    ]));
    return;
  }

  const cleanTitle = title.trim();

  if (cleanTitle.length > MAX_TITLE_LENGTH) {
    next(new AppError('El campo title es demasiado largo.', 422, 'VALIDATION_ERROR', [
      { field: 'title', message: `title no debe superar ${MAX_TITLE_LENGTH} caracteres.` }
    ]));
    return;
  }

  res.locals.taskTitle = cleanTitle;
  next();
};
