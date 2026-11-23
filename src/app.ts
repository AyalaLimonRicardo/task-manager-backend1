import express from 'express';
import { pingDatabase } from './config/database.js';
import { authRouter } from './routes/auth.routes.js';
import { taskRouter } from './routes/task.routes.js';
import { requestContext } from './middlewares/request-context.middleware.js';
import { corsPolicy, securityHeaders } from './middlewares/security.middleware.js';
import { notFound } from './middlewares/not-found.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';

export const app = express();

app.disable('x-powered-by');
// Orden importante: requestId primero, luego Helmet y CORS, después el parser y las rutas.
app.use(requestContext);
app.use(securityHeaders);
app.use(corsPolicy);
app.use(express.json({ limit: '20kb' }));

// Rutas públicas.
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/health/database', async (_req, res) => {
  const connected = await pingDatabase();
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'error',
    database: { status: connected ? 'connected' : 'unavailable' }
  });
});

app.use('/api/auth', authRouter);
// Protegidas por authenticate dentro del propio router.
app.use('/api/tasks', taskRouter);
app.use(notFound);
// errorHandler siempre al final y con sus cuatro parámetros.
app.use(errorHandler);
