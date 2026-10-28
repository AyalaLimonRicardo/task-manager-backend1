import mongoose, { type HydratedDocument } from 'mongoose';
import { AppError } from '../errors/app-error.js';
import {
  TaskModel,
  type Task,
  type TaskPersistence,
  type TaskPriority,
  type TaskUpdate
} from '../models/task.js';

export interface NewTask {
  title: string;
  description?: string;
  priority?: TaskPriority;
}

const toTask = (document: HydratedDocument<TaskPersistence>): Task => ({
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

const mapPersistenceError = (error: unknown): AppError => {
  if (error instanceof AppError) return error;

  if (error instanceof mongoose.Error.ValidationError) {
    const details = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message
    }));
    return new AppError(
      'La tarea no cumple las reglas del modelo.',
      422,
      'PERSISTENCE_VALIDATION_ERROR',
      details
    );
  }

  return new AppError(
    'No fue posible acceder al almacenamiento de tareas.',
    503,
    'DATABASE_UNAVAILABLE'
  );
};

export const listTasks = async (): Promise<Task[]> => {
  try {
    const documents = await TaskModel.find().sort({ createdAt: 1 });
    return documents.map(toTask);
  } catch (error: unknown) {
    throw mapPersistenceError(error);
  }
};

export const findTaskById = async (id: string): Promise<Task> => {
  try {
    const document = await TaskModel.findById(id);
    if (!document) throw notFound(id);
    return toTask(document);
  } catch (error: unknown) {
    throw mapPersistenceError(error);
  }
};

export const createTask = async (input: NewTask): Promise<Task> => {
  try {
    const document = await TaskModel.create({
      title: input.title,
      ...(input.description ? { description: input.description } : {}),
      ...(input.priority ? { priority: input.priority } : {}),
      status: 'pending'
    });
    return toTask(document);
  } catch (error: unknown) {
    throw mapPersistenceError(error);
  }
};

// Actualización parcial: $set modifica solo los campos recibidos y deja intactos los demás.
export const updateTask = async (
  id: string,
  changes: TaskUpdate
): Promise<Task> => {
  try {
    const document = await TaskModel.findByIdAndUpdate(
      id,
      { $set: changes },
      { new: true, runValidators: true }
    );
    if (!document) throw notFound(id);
    return toTask(document);
  } catch (error: unknown) {
    throw mapPersistenceError(error);
  }
};

// Se conserva como compatibilidad: usa la misma consulta, validación y 404 que PATCH /:id.
export const completeTask = async (id: string): Promise<Task> =>
  updateTask(id, { status: 'completed' });

export const deleteTask = async (id: string): Promise<void> => {
  try {
    const document = await TaskModel.findByIdAndDelete(id);
    if (!document) throw notFound(id);
  } catch (error: unknown) {
    throw mapPersistenceError(error);
  }
};
