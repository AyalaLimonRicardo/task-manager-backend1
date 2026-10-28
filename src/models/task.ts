import { Schema, model } from 'mongoose';

export const TASK_STATUSES = ['pending', 'completed'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

// Desafío A7: prioridad opcional con valor predeterminado medium.
export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface TaskPersistence {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
}

// PATCH puede recibir cualquier combinación de estos campos, por eso todos son opcionales.
export interface TaskUpdate {
  title?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

const taskSchema = new Schema<TaskPersistence>(
  {
    title: {
      type: String,
      required: [true, 'El título es obligatorio.'],
      trim: true,
      maxlength: [120, 'El título no debe superar 120 caracteres.']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'La descripción no debe superar 300 caracteres.']
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: 'pending'
    },
    priority: {
      type: String,
      enum: {
        values: TASK_PRIORITIES,
        message: 'La prioridad debe ser low, medium o high.'
      },
      default: 'medium'
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const TaskModel = model<TaskPersistence>('Task', taskSchema);
