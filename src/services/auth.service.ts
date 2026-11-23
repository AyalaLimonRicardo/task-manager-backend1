import { env } from '../config/env.js';
import { AppError } from '../errors/app-error.js';
import type { User } from '../models/user.js';
import {
  createUserDocument,
  findUserDocumentByEmail,
  findUserDocumentById,
  type UserDocument
} from '../repositories/user.repository.js';
import type {
  AccessTokenSubject,
  LoginInput,
  LoginResult,
  RegisterInput,
  RegisterResult
} from '../types/auth.js';
import { hashPassword, verifyPassword } from './password.service.js';
import { createAccessToken } from './token.service.js';

// Hash ficticio: se compara aunque el correo no exista, para que el tiempo de respuesta
// no revele si la cuenta existe. No corresponde a ninguna contraseña real.
const DUMMY_PASSWORD_HASH =
  '$2b$12$4Nptb/DI99TKeLx26iuqtehwLW10q1/Mbk5nKB84xPx8eUzn1uftq';

// Representación pública: excluye passwordHash de forma explícita.
const toUser = (document: UserDocument): User => ({
  id: document._id.toString(),
  name: document.name,
  email: document.email,
  role: document.role,
  createdAt: document.createdAt,
  updatedAt: document.updatedAt
});

export const registerUser = async (
  input: RegisterInput
): Promise<RegisterResult> => {
  const email = input.email.trim().toLowerCase();
  const existing = await findUserDocumentByEmail(email);
  if (existing) {
    throw new AppError(
      'Ya existe una cuenta con ese correo electrónico.',
      409,
      'USER_EMAIL_EXISTS'
    );
  }
  const passwordHash = await hashPassword(input.password);
  // El rol nunca viene del cliente: todo registro crea un usuario normal.
  const document = await createUserDocument({
    name: input.name,
    email,
    passwordHash,
    role: 'user'
  });
  return { user: toUser(document) };
};

export const loginUser = async (input: LoginInput): Promise<LoginResult> => {
  const email = input.email.trim().toLowerCase();
  const document = await findUserDocumentByEmail(email, true);
  const passwordHash = document?.passwordHash ?? DUMMY_PASSWORD_HASH;
  const validPassword = await verifyPassword({
    password: input.password,
    passwordHash
  });
  // Mismo mensaje para correo inexistente y contraseña incorrecta.
  if (!document || !validPassword) {
    throw new AppError(
      'El correo o la contraseña son incorrectos.',
      401,
      'INVALID_CREDENTIALS'
    );
  }
  const user = toUser(document);
  return {
    user,
    accessToken: await createAccessToken(user),
    tokenType: 'Bearer',
    expiresIn: env.JWT_EXPIRES_IN
  };
};

// Identidad actual: el id y el rol salen del JWT ya verificado, nunca del cliente.
// El rol devuelto es el del token porque es el que authorize aplica en cada petición:
// así la interfaz muestra exactamente lo que la API va a permitir. Si el rol cambió en
// MongoDB, el usuario debe iniciar sesión de nuevo para obtener un token con el rol nuevo.
export const getCurrentUser = async (subject: AccessTokenSubject): Promise<User> => {
  const document = await findUserDocumentById(subject.userId);
  if (!document) {
    // Cuenta eliminada con un token aún vigente: la sesión ya no es válida.
    throw new AppError(
      'La cuenta asociada al token ya no existe.',
      401,
      'USER_NOT_FOUND'
    );
  }
  return { ...toUser(document), role: subject.role };
};
