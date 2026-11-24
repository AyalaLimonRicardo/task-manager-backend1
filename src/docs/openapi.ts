import { env } from '../config/env.js';

// Contrato OpenAPI 3.1 de la API. Debe coincidir con el comportamiento real del código.
const errorResponse = (description: string) => ({
  description,
  content: {
    'application/json': { schema: { $ref: '#/components/schemas/ApiError' } }
  }
});

const bearer = [{ bearerAuth: [] }];

export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Task API',
    version: env.APP_VERSION,
    description: 'API REST de tareas con autenticación JWT y roles.'
  },
  servers: [
    {
      url: env.PUBLIC_API_URL,
      description: env.NODE_ENV === 'production' ? 'Producción' : 'Desarrollo local'
    }
  ],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Tasks' }
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Estado del servicio',
        responses: { '200': { description: 'Servicio activo' } }
      }
    },
    '/health/database': {
      get: {
        tags: ['Health'],
        summary: 'Estado de la base de datos',
        responses: {
          '200': { description: 'Base de datos conectada' },
          '503': { description: 'Base de datos no disponible' }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterInput' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Usuario creado (siempre con rol user)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: { user: { $ref: '#/components/schemas/User' } }
                    }
                  }
                }
              }
            }
          },
          '409': errorResponse('USER_EMAIL_EXISTS'),
          '415': errorResponse('Content-Type no soportado'),
          '422': errorResponse('Datos inválidos'),
          '429': errorResponse('AUTH_RATE_LIMIT_EXCEEDED')
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesión',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginInput' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Credenciales válidas',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/LoginResult' }
                  }
                }
              }
            }
          },
          '401': errorResponse('INVALID_CREDENTIALS'),
          '415': errorResponse('Content-Type no soportado'),
          '422': errorResponse('Datos inválidos'),
          '429': errorResponse('AUTH_RATE_LIMIT_EXCEEDED')
        }
      }
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Usuario autenticado',
        security: bearer,
        responses: {
          '200': {
            description: 'Usuario actual',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: { user: { $ref: '#/components/schemas/User' } }
                    }
                  }
                }
              }
            }
          },
          '401': errorResponse(
            'AUTHENTICATION_REQUIRED, INVALID_AUTHORIZATION_HEADER, INVALID_TOKEN o AUTHENTICATED_USER_NOT_FOUND'
          )
        }
      }
    },
    '/api/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'Listar tareas',
        security: bearer,
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 } },
          { name: 'status', in: 'query', schema: { $ref: '#/components/schemas/TaskStatus' } },
          { name: 'search', in: 'query', schema: { type: 'string', maxLength: 60 } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'title', 'status'] } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } }
        ],
        responses: {
          '200': {
            description: 'Página de tareas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TaskList' }
              }
            }
          },
          '401': errorResponse('Autenticación requerida o token inválido'),
          '422': errorResponse('QUERY_VALIDATION_ERROR')
        }
      },
      post: {
        tags: ['Tasks'],
        summary: 'Crear tarea',
        security: bearer,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NewTask' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Tarea creada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Task' } }
                }
              }
            }
          },
          '401': errorResponse('Autenticación requerida o token inválido'),
          '415': errorResponse('Content-Type no soportado'),
          '422': errorResponse('Datos inválidos')
        }
      }
    },
    '/api/tasks/{id}': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
      ],
      get: {
        tags: ['Tasks'],
        summary: 'Consultar tarea',
        security: bearer,
        responses: {
          '200': {
            description: 'Tarea encontrada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Task' } }
                }
              }
            }
          },
          '401': errorResponse('Autenticación requerida o token inválido'),
          '404': errorResponse('TASK_NOT_FOUND'),
          '422': errorResponse('Identificador inválido')
        }
      },
      patch: {
        tags: ['Tasks'],
        summary: 'Actualizar tarea',
        security: bearer,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TaskUpdate' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Tarea actualizada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Task' } }
                }
              }
            }
          },
          '401': errorResponse('Autenticación requerida o token inválido'),
          '404': errorResponse('TASK_NOT_FOUND'),
          '415': errorResponse('Content-Type no soportado'),
          '422': errorResponse('Datos inválidos')
        }
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Eliminar tarea (solo admin)',
        security: bearer,
        responses: {
          '204': { description: 'Tarea eliminada' },
          '401': errorResponse('Autenticación requerida o token inválido'),
          '403': errorResponse('FORBIDDEN: se requiere rol admin'),
          '404': errorResponse('TASK_NOT_FOUND'),
          '422': errorResponse('Identificador inválido')
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    },
    schemas: {
      ApiError: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'object',
            required: ['code', 'message'],
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: {},
              requestId: { type: 'string' }
            }
          }
        }
      },
      Role: { type: 'string', enum: ['user', 'admin'] },
      User: {
        type: 'object',
        required: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { $ref: '#/components/schemas/Role' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      RegisterInput: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 15, writeOnly: true }
        }
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', writeOnly: true }
        }
      },
      LoginResult: {
        type: 'object',
        required: ['user', 'accessToken', 'tokenType', 'expiresIn'],
        properties: {
          user: { $ref: '#/components/schemas/User' },
          accessToken: { type: 'string' },
          tokenType: { type: 'string', const: 'Bearer' },
          expiresIn: { type: 'string', examples: ['1h'] }
        }
      },
      TaskStatus: { type: 'string', enum: ['pending', 'completed'] },
      TaskPriority: { type: 'string', enum: ['low', 'medium', 'high'] },
      Task: {
        type: 'object',
        required: ['id', 'title', 'status', 'priority', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string', maxLength: 120 },
          description: { type: 'string', maxLength: 300 },
          status: { $ref: '#/components/schemas/TaskStatus' },
          priority: { $ref: '#/components/schemas/TaskPriority' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      NewTask: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', maxLength: 120 },
          description: { type: 'string', maxLength: 300 },
          priority: { $ref: '#/components/schemas/TaskPriority' }
        }
      },
      TaskUpdate: {
        type: 'object',
        minProperties: 1,
        properties: {
          title: { type: 'string', maxLength: 120 },
          status: { $ref: '#/components/schemas/TaskStatus' },
          priority: { $ref: '#/components/schemas/TaskPriority' }
        }
      },
      TaskList: {
        type: 'object',
        required: ['data', 'meta'],
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
          meta: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              total: { type: 'integer' },
              totalPages: { type: 'integer' },
              hasNextPage: { type: 'boolean' },
              hasPreviousPage: { type: 'boolean' }
            }
          }
        }
      }
    }
  }
} as const;
