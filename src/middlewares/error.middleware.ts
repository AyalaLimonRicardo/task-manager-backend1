import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';

const isMalformedJson = (error: unknown): boolean =>
  typeof error === 'object'
  && error !== null
  && (error as { type?: unknown }).type === 'entity.parse.failed';

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const requestId = res.locals.requestId as string | undefined;

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
        requestId
      }
    });
    return;
  }

  if (isMalformedJson(error)) {
    res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'El cuerpo JSON no es válido.', requestId }
    });
    return;
  }

  // Solo el servidor ve el detalle; el cliente nunca recibe stack ni mensajes internos.
  console.error(`[${requestId ?? 'sin-id'}]`, error instanceof Error ? error.message : 'Error desconocido');
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor.', requestId }
  });
};
