import type { Request, Response } from 'express';

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `No existe ${req.method} ${req.originalUrl}.`,
      requestId: res.locals.requestId as string | undefined
    }
  });
};
