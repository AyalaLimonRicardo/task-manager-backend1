import { Router } from 'express';
import { getMe, postLogin, postRegister } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';
import { requireJson } from '../middlewares/require-json.middleware.js';
import { authRateLimiter } from '../middlewares/security.middleware.js';
import { validateLogin, validateRegister } from '../middlewares/validate-auth.middleware.js';

export const authRouter = Router();

// Públicas por necesidad: el usuario todavía no tiene token.
// El limitador va primero para frenar fuerza bruta antes de validar o consultar la base.
// Solo se aplica aquí: /me se consulta en cada recarga del Frontend y no debe agotar el límite.
authRouter.post('/register', authRateLimiter, requireJson, validateRegister, postRegister);
authRouter.post('/login', authRateLimiter, requireJson, validateLogin, postLogin);

// Protegida: exige Bearer JWT válido.
authRouter.get('/me', authenticate, getMe);
