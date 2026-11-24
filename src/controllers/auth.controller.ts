import type { Request, Response } from 'express';
import { getAuthenticatedUser, loginUser, registerUser } from '../services/auth.service.js';

// Los datos ya fueron validados y viven en res.locals; no se lee req.body aquí.
export const postRegister = async (_req: Request, res: Response): Promise<void> => {
  res.status(201).json({ data: await registerUser(res.locals.registerInput) });
};

export const postLogin = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({ data: await loginUser(res.locals.loginInput) });
};

// authenticate ya verificó el JWT y dejó la identidad en res.locals.auth.
export const getMe = async (_req: Request, res: Response): Promise<void> => {
  const auth = res.locals.auth;
  if (!auth) {
    throw new Error('authenticate debe ejecutarse antes de getMe.');
  }
  res.status(200).json({ data: { user: await getAuthenticatedUser(auth.userId) } });
};
