import type { ApiError, LoginResponse, TaskListResponse } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init);
  const body: unknown = await response.json();
  if (!response.ok) {
    const { error } = body as ApiError;
    throw new Error(`${error.code}: ${error.message}`);
  }
  return body as T;
}

export const login = (email: string, password: string) =>
  request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

export const fetchTasks = (token: string) =>
  request<TaskListResponse>('/api/tasks?limit=10', {
    headers: { Authorization: `Bearer ${token}` }
  });
