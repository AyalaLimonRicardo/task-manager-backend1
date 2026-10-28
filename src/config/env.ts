import 'dotenv/config';

const required = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`La variable de entorno ${name} es obligatoria.`);
  }
  return value;
};

const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error('PORT debe ser un entero positivo.');
}

export const env = {
  port,
  mongodbUri: required('MONGODB_URI'),
  mongodbDbName: required('MONGODB_DB_NAME')
} as const;
