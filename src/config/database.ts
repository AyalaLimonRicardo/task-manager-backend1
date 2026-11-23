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
