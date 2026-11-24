import { useState } from 'react';
import type { FormEvent } from 'react';
import { fetchTasks, login } from './api';
import type { Task } from './types';

// Cliente mínimo de integración: el token solo vive en memoria.
export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [message, setMessage] = useState('Inicia sesión para consultar tareas.');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const session = await login(email, password);
      const list = await fetchTasks(session.data.accessToken);
      setTasks(list.data);
      setMessage(`Sesión de ${session.data.user.name} (${session.data.user.role}).`);
    } catch (error) {
      setTasks([]);
      setMessage(error instanceof Error ? error.message : 'Error inesperado.');
    }
  }

  return (
    <main>
      <h1>Task API Client</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Correo
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit">Entrar</button>
      </form>
      <p role="status">{message}</p>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.title} — {task.status}
          </li>
        ))}
      </ul>
    </main>
  );
}
