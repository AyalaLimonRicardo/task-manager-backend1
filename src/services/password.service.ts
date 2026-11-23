import bcrypt from 'bcryptjs';
import { AppError } from '../errors/app-error.js';
import { MAX_PASSWORD_BYTES } from '../types/auth.js';

// 12 rondas: aumenta el costo de cada intento sin cambiar la forma de usar el servicio.
const BCRYPT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  // bcrypt ignora en silencio los bytes después del 72; se rechaza en lugar de truncar.
  if (bcrypt.truncates(password)) {
    throw new AppError(
      `La contraseña no debe superar ${MAX_PASSWORD_BYTES} bytes en UTF-8.`,
      422,
      'AUTH_VALIDATION_ERROR',
      [{ field: 'password', message: `No debe superar ${MAX_PASSWORD_BYTES} bytes en UTF-8.` }]
    );
  }
  return bcrypt.hash(password, BCRYPT_ROUNDS);
};

export const verifyPassword = async ({
  password,
  passwordHash
}: {
  password: string;
  passwordHash: string;
}): Promise<boolean> => bcrypt.compare(password, passwordHash);
