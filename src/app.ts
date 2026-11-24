import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { ensureDatabase, pingDatabase } from './config/database.js';
import { env } from './config/env.js';
import { authRouter } from './routes/auth.routes.js';
import { taskRouter } from './routes/task.routes.js';
import { requestContext } from './middlewares/request-context.middleware.js';
import { openApiDocument } from './docs/openapi.js';
import {
  corsPolicy,
  documentationSecurityHeaders,
  securityHeaders
} from './middlewares/security.middleware.js';
import { notFound } from './middlewares/not-found.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { requireDatabase } from './middlewares/ensure-database.middleware.js';

export const app = express();

app.disable('x-powered-by');
// Solo se confía en el proxy cuando hay uno delante (Vercel = 1 salto; en local, 0).
if (env.TRUST_PROXY_HOPS > 0) app.set('trust proxy', env.TRUST_PROXY_HOPS);
// Orden importante: requestId primero, luego Helmet y CORS, después el parser y las rutas.
app.use(requestContext);

// Documentación: va antes de securityHeaders porque necesita una CSP más permisiva.
app.get('/api-docs.json', documentationSecurityHeaders, (_req, res) => {
  res.status(200).json(openApiDocument);
});
app.use(
  '/api-docs',
  documentationSecurityHeaders,
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument as unknown as Record<string, unknown>, { customSiteTitle: 'Task API' })
);

app.use(securityHeaders);
app.use(corsPolicy);
app.use(express.json({ limit: '20kb' }));

// Rutas públicas.
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    version: env.APP_VERSION,
    environment: env.NODE_ENV
  });
});

app.get('/health/database', async (_req, res) => {
  // Si la instancia es nueva, intenta conectar antes de informar el estado.
  await ensureDatabase().catch(() => undefined);
  const connected = await pingDatabase();
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'error',
    database: { status: connected ? 'connected' : 'unavailable' }
  });
});

// Abre (o reutiliza) la conexión con MongoDB antes de cualquier ruta de la API.
app.use('/api', requireDatabase);
app.use('/api/auth', authRouter);
// Protegidas por authenticate dentro del propio router.
app.use('/api/tasks', taskRouter);
app.use(notFound);
// errorHandler siempre al final y con sus cuatro parámetros.
app.use(errorHandler);

// Vercel detecta este archivo (importa express) y necesita la aplicación como export por defecto.
export default app;
