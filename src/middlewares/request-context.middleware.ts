import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

// Debe ir primero: incluso un rechazo de seguridad lleva requestId.
// El valor se crea dentro del middleware, uno nuevo por solicitud.
export const requestContext = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = randomUUID();
  res.locals.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
};
