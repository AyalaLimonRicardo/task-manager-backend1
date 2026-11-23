import type { Task } from '../models/task.js';

// Datos de ejemplo de actividades antiguas (almacenamiento en memoria). Ya no se usan:
// la API persiste en MongoDB. Se conserva ajustado al modelo actual para que compile.
export const tasks: Task[] = [
  {
    id: '1',
    title: 'Configurar el proyecto backend',
    status: 'completed',
    priority: 'medium',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    title: 'Probar la API con Postman',
    status: 'pending',
    priority: 'medium',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
