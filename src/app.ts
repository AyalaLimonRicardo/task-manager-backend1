import express from 'express';
import { pingDatabase } from './config/database.js';
import { taskRouter } from './routes/task.routes.js';
import { requestId } from './middlewares/request-id.middleware.js';
import { notFound } from './middlewares/not-found.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';

export const app = express();

app.use(requestId);
app.use(express.json());

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

app.use('/api/tasks', taskRouter);
app.use(notFound);
app.use(errorHandler);
