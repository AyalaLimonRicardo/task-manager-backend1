import { Router } from 'express';
import {
  getTask,
  getTasks,
  patchTask,
  patchTaskComplete,
  postTask,
  removeTask
} from '../controllers/task.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';
import { requireRole } from '../middlewares/authorize.middleware.js';
import { requireJson } from '../middlewares/require-json.middleware.js';
import { validateTaskDescription } from '../middlewares/validate-task-description.middleware.js';
import { validateTaskId } from '../middlewares/validate-task-id.middleware.js';
import { validateTaskPriority } from '../middlewares/validate-task-priority.middleware.js';
import { validateTaskQuery } from '../middlewares/validate-task-query.middleware.js';
import { validateTaskTitle } from '../middlewares/validate-task-title.middleware.js';
import { validateTaskUpdate } from '../middlewares/validate-task-update.middleware.js';

export const taskRouter = Router();

// Autenticación primero (A10): todo /api/tasks exige un Bearer JWT válido.
// Un id o cuerpo inválido no se valida antes de autenticar, para no dar pistas a anónimos.
taskRouter.use(authenticate);
taskRouter.param('id', validateTaskId);

// La validación de consulta (A8) solo aplica al listado.
taskRouter.get('/', validateTaskQuery, getTasks);
taskRouter.get('/:id', getTask);
taskRouter.post(
  '/',
  requireJson,
  validateTaskTitle,
  validateTaskDescription,
  validateTaskPriority,
  postTask
);
taskRouter.patch('/:id', requireJson, validateTaskUpdate, patchTask);
taskRouter.patch('/:id/complete', patchTaskComplete);
// Solo admin puede eliminar: authenticate (ya aplicado) -> requireRole -> controlador.
taskRouter.delete('/:id', requireRole('admin'), removeTask);
