import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Dobles de la capa de servicios: las pruebas no tocan MongoDB.
const mocks = vi.hoisted(() => ({
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  getAuthenticatedUser: vi.fn(),
  listTasks: vi.fn(),
  findTaskById: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  completeTask: vi.fn(),
  deleteTask: vi.fn()
}));

vi.mock('../src/services/auth.service.js', () => ({
  registerUser: mocks.registerUser,
  loginUser: mocks.loginUser,
  getAuthenticatedUser: mocks.getAuthenticatedUser
}));
vi.mock('../src/services/task.service.js', () => ({
  listTasks: mocks.listTasks,
  findTaskById: mocks.findTaskById,
  createTask: mocks.createTask,
  updateTask: mocks.updateTask,
  completeTask: mocks.completeTask,
  deleteTask: mocks.deleteTask
}));

const { app } = await import('../src/app.js');
const { createAccessToken } = await import('../src/services/token.service.js');

const now = new Date('2026-01-01T00:00:00.000Z');
const ID = '665f1c2e8b3a4d0012345678';
const makeUser = (role: 'user' | 'admin') => ({
  id: ID,
  name: 'Persona Demo',
  email: 'demo@example.com',
  role,
  createdAt: now,
  updatedAt: now
});
const task = {
  id: ID,
  title: 'Tarea demo',
  status: 'pending',
  priority: 'medium',
  createdAt: now,
  updatedAt: now
};

describe('API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /health responde 200', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
    expect(response.headers['x-request-id']).toBeDefined();
  });

  it('POST /api/auth/login responde 200 con token y sin passwordHash', async () => {
    mocks.loginUser.mockResolvedValue({
      user: makeUser('user'),
      accessToken: 'token-de-prueba',
      tokenType: 'Bearer',
      expiresIn: '1h'
    });
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@example.com', password: 'una-contrasena-larga-123' });
    expect(response.status).toBe(200);
    expect(response.body.data.tokenType).toBe('Bearer');
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');
  });

  it('GET /api/auth/me exige token y devuelve el usuario con uno válido', async () => {
    const anonymous = await request(app).get('/api/auth/me');
    expect(anonymous.status).toBe(401);
    expect(anonymous.body.error.code).toBe('AUTHENTICATION_REQUIRED');

    mocks.getAuthenticatedUser.mockResolvedValue(makeUser('user'));
    const token = await createAccessToken(makeUser('user'));
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe('demo@example.com');
    expect(mocks.getAuthenticatedUser).toHaveBeenCalledWith(ID);
  });

  it('GET /api/tasks sin token responde 401 y con token 200', async () => {
    const anonymous = await request(app).get('/api/tasks');
    expect(anonymous.status).toBe(401);
    expect(mocks.listTasks).not.toHaveBeenCalled();

    mocks.listTasks.mockResolvedValue({
      data: [task],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      }
    });
    const token = await createAccessToken(makeUser('user'));
    const response = await request(app)
      .get('/api/tasks?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.meta.total).toBe(1);
  });

  it('DELETE /api/tasks/:id responde 403 a user y 204 a admin', async () => {
    mocks.deleteTask.mockResolvedValue(undefined);
    const userToken = await createAccessToken(makeUser('user'));
    const forbidden = await request(app)
      .delete(`/api/tasks/${ID}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(forbidden.status).toBe(403);
    expect(forbidden.body.error.code).toBe('FORBIDDEN');
    expect(mocks.deleteTask).not.toHaveBeenCalled();

    const adminToken = await createAccessToken(makeUser('admin'));
    const deleted = await request(app)
      .delete(`/api/tasks/${ID}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleted.status).toBe(204);
    expect(mocks.deleteTask).toHaveBeenCalledWith(ID);
  });

  it('publica /api-docs.json con OpenAPI 3.1 y las rutas principales', async () => {
    const response = await request(app).get('/api-docs.json');
    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe('3.1.0');
    expect(Object.keys(response.body.paths)).toEqual(
      expect.arrayContaining(['/api/auth/login', '/api/auth/me', '/api/tasks/{id}'])
    );
  });
});
