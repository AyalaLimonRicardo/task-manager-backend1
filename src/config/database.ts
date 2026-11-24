import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDatabase = async (): Promise<void> => {
  await mongoose.connect(env.MONGODB_URI, {
    dbName: env.MONGODB_DB_NAME,
    serverSelectionTimeoutMS: 5000
  });
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
};

export const pingDatabase = async (): Promise<boolean> => {
  const db = mongoose.connection.db;
  if (mongoose.connection.readyState !== 1 || !db) return false;
  try {
    await db.admin().ping();
    return true;
  } catch {
    return false;
  }
};

// En Vercel cada instancia arranca en frío y no pasa por server.ts: la conexión se abre
// bajo demanda y se reutiliza mientras la instancia siga viva. Las solicitudes simultáneas
// comparten la misma promesa para no abrir varias conexiones.
let connecting: Promise<void> | undefined;

export const ensureDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) return;
  connecting ??= connectDatabase().finally(() => {
    connecting = undefined;
  });
  await connecting;
};
