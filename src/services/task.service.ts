import { AppError } from '../errors/app-error.js';
import type { Task, NewTask, TaskUpdate } from '../models/task.js';
import {
  createTaskDocument,
  deleteTaskDocument,
  findTaskDocumentById,
  findTaskDocuments,
  updateTaskDocument,
  type TaskDocument
} from '../repositories/task.repository.js';
import type { TaskListQuery, TaskListResult } from '../types/task-query.js';

export type { NewTask } from '../models/task.js';

// Representación pública: sin _id ni __v.
const toTask = (document: TaskDocument): Task => ({
  id: document._id.toString(),
  title: document.title,
  ...(document.description ? { description: document.description } : {}),
  status: document.status,
  priority: document.priority,
  createdAt: document.createdAt,
  updatedAt: document.updatedAt
});

const notFound = (id: string): AppError =>
  new AppError(`No existe una tarea con el id ${id}.`, 404, 'TASK_NOT_FOUND');

export const listTasks = async (
  query: TaskListQuery
): Promise<TaskListResult> => {
  const { documents, total } = await findTaskDocuments(query);
  const totalPages = Math.ceil(total / query.limit);
  return {
    data: documents.map(toTask),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
      hasNextPage: query.page < totalPages,
      hasPreviousPage: query.page > 1 && totalPages > 0
    }
  };
};

export const findTaskById = async (id: string): Promise<Task> => {
  const document = await findTaskDocumentById(id);
  if (!document) throw notFound(id);
  return toTask(document);
};

export const createTask = async (input: NewTask): Promise<Task> => {
  const document = await createTaskDocument(input);
  return toTask(document);
};

// Actualización parcial: solo cambia los campos recibidos.
export const updateTask = async (
  id: string,
  changes: TaskUpdate
): Promise<Task> => {
  const document = await updateTaskDocument(id, changes);
  if (!document) throw notFound(id);
  return toTask(document);
};

// Se conserva como compatibilidad: usa la misma consulta, validación y 404 que PATCH /:id.
export const completeTask = async (id: string): Promise<Task> =>
  updateTask(id, { status: 'completed' });

export const deleteTask = async (id: string): Promise<void> => {
  const document = await deleteTaskDocument(id);
  if (!document) throw notFound(id);
};
