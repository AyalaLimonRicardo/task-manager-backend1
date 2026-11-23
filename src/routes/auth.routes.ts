import { Router } from 'express';
import { postLogin, postRegister } from '../controllers/auth.controller.js';
import { requireJson } from '../middlewares/require-json.middleware.js';
import { authRateLimiter } from '../middlewares/security.middleware.js';
import { validateLogin, validateRegister } from '../middlewares/validate-auth.middleware.js';

// Rutas públicas por necesidad: el usuario todavía no tiene token.
// El limitador va primero para frenar fuerza bruta antes de validar o consultar la base.
export const authRouter = Router();
authRouter.use(authRateLimiter);
authRouter.post('/register', requireJson, validateRegister, postRegister);
authRouter.post('/login', requireJson, validateLogin, postLogin);
