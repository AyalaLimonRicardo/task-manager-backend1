import type { Request, Response } from 'express';
import { loginUser, registerUser } from '../services/auth.service.js';

// Los datos ya fueron validados y viven en res.locals; no se lee req.body aquí.
export const postRegister = async (_req: Request, res: Response): Promise<void> => {
  res.status(201).json({ data: await registerUser(res.locals.registerInput) });
};

export const postLogin = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({ data: await loginUser(res.locals.loginInput) });
};
