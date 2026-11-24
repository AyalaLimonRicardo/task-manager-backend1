export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface TaskListResponse {
  data: Task[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface LoginResponse {
  data: { accessToken: string; user: { name: string; role: 'user' | 'admin' } };
}

export interface ApiError {
  error: { code: string; message: string; requestId?: string };
}
