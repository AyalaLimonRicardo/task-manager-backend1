# Pruebas de consultas de tareas (EC2 F3 A8)

## Entorno

- Rama: _(escribe la rama que uses; la guía sugiere `feature/consultas-paginadas`)_
- Base: task_api
- Colección: tasks
- Node: v22.23.5 · pnpm: 10.28.0
- Resultado de `pnpm check`: correcto, sin errores de TypeScript.
- Resultado de `pnpm build`: correcto; `dist/repositories/task.repository.js`, `dist/types/task-query.js` y `dist/middlewares/validate-task-query.middleware.js` existen.

## Cómo se probó

Las pruebas siguientes se ejecutaron con un script sobre `dist/app.js` (Express, middlewares, servicio y repositorio reales).
Solo se sustituyeron los métodos de Mongoose (`find`, `countDocuments`, `findById`, etc.) por un almacén en memoria que **aplica el mismo filtro, orden, skip y limit que construye el repositorio**.
Por eso validan la lógica de la actividad, pero **no la conexión con Atlas**: los pasos marcados como _pendiente_ debes repetirlos con tu clúster y Postman.

> A partir de A10 todo `/api/tasks` exige un Bearer JWT; en estas pruebas se usó un token `user` válido.
> La colección `docs/EC3_A8_A9_A10.postman_collection.json` trae estas mismas solicitudes con sus pruebas automáticas.

## Datos preparados

- Total de tareas: 5 (Aprender Express, Documentar MongoDB, Practicar búsqueda, Revisar API, Preparar entrega)
- Tareas pending: 3
- Tareas completed: 2 (Documentar MongoDB y Revisar API)

## Casos ejecutados

| Tipo | Método y ruta | Esperado | Obtenido | requestId | Resultado |
|---|---|---|---|---|---|
| Positiva | GET /api/tasks | 200, data y meta (page 1, limit 10, total 5) | 200, meta coincide | — | Sí |
| Positiva | GET /api/tasks (orden por defecto) | createdAt asc, sin `_id` ni `__v` | del más antiguo al más reciente | — | Sí |
| Positiva | GET /api/tasks?page=1&limit=2 | 2 tareas, totalPages 3, hasNextPage true, hasPreviousPage false | coincide | — | Sí |
| Positiva | GET /api/tasks?page=2&limit=2 | Subconjunto distinto al de la página 1 | sin repetidos | — | Sí |
| Positiva | GET /api/tasks?page=9&limit=2 | 200, data vacío, meta coherente | 200, data `[]`, total 5 | — | Sí |
| Positiva | GET /api/tasks?status=completed | Solo completed, total 2 | total 2 | — | Sí |
| Positiva | GET /api/tasks?status=pending | Solo pending, total 3 | total 3 | — | Sí |
| Positiva | GET /api/tasks?search=api | Encuentra "Revisar API" | 1 resultado | — | Sí |
| Positiva | GET /api/tasks?search=MONGODB | No distingue mayúsculas | "Documentar MongoDB" | — | Sí |
| Positiva | GET /api/tasks?search=.* | Se trata como texto literal | total 0; regex `/\.\*/i` | — | Sí |
| Positiva | GET /api/tasks?sortBy=title&order=asc | Orden alfabético | coincide | — | Sí |
| Positiva | GET /api/tasks?sortBy=title&order=desc | Orden inverso | coincide | — | Sí |
| Positiva | GET /api/tasks?sortBy=updatedAt&order=desc | 200, modificadas primero | coincide | — | Sí |
| Positiva | GET /api/tasks?status=pending&search=a&page=1&limit=2&sortBy=title&order=asc | 200, data ≤ 2, total del filtrado | total 3, totalPages 2 | — | Sí |
| Negativa | GET /api/tasks?page=0 | 422 QUERY_VALIDATION_ERROR | 422 | presente | Sí |
| Negativa | GET /api/tasks?page=abc | 422 | 422 | presente | Sí |
| Negativa | GET /api/tasks?page=1&page=2 | 422 (parámetro repetido) | 422 | presente | Sí |
| Negativa | GET /api/tasks?limit=0 | 422 | 422 | presente | Sí |
| Negativa | GET /api/tasks?limit=51 | 422 | 422 | presente | Sí |
| Negativa | GET /api/tasks?status=archived | 422 | 422 | presente | Sí |
| Negativa | GET /api/tasks?search= | 422 | 422 | presente | Sí |
| Negativa | GET /api/tasks?search=(61 caracteres) | 422 | 422 | presente | Sí |
| Negativa | GET /api/tasks?sortBy=priority | 422 | 422 | presente | Sí |
| Negativa | GET /api/tasks?order=sideways | 422 | 422 | presente | Sí |
| Negativa | GET /api/tasks?owner=ana | 422, `details[0].field` = owner | 422, field owner | presente | Sí |
| Negativa | Almacenamiento no disponible | 503 DATABASE_UNAVAILABLE sin detalles internos | 503, sin URI ni stack | presente | Sí |
| Regresión | POST /api/tasks | 201 | 201 | — | Sí |
| Regresión | GET /api/tasks/:id | 200 | 200 | — | Sí |
| Regresión | PATCH /api/tasks/:id | 200 | 200 | — | Sí |
| Regresión | PATCH /api/tasks/:id/complete | 200 | 200 | — | Sí |
| Regresión | DELETE /api/tasks/:id (admin) | 204 sin cuerpo | 204 | — | Sí |
| Regresión | GET /api/tasks/:id tras borrar | 404 TASK_NOT_FOUND | 404 | presente | Sí |
| Regresión | GET /api/tasks/id-invalido | 400 INVALID_ID | 400 | presente | Sí |

El `requestId` de cada error coincide con el encabezado `X-Request-Id` de la misma respuesta.

## Pendiente de ejecutar con tu clúster de Atlas

- `GET /health` y `GET /health/database` con 200 y Atlas conectado.
- Persistencia después de reiniciar (`pnpm dev`, detener, volver a iniciar y consultar).
- Captura de Atlas Data Explorer con tres `pending` y dos `completed` (sin URI, usuario, contraseña ni host).
- Comprobar 503 deteniendo Atlas de forma controlada.

## Evidencias

1. Compilación correcta.
2. Dos páginas sin documentos repetidos.
3. Filtro y búsqueda combinados.
4. Orden ascendente y descendente.
5. Error 422 con `details` y `requestId`.
6. CRUD heredado completo.
7. Persistencia después de reiniciar: _pendiente (requiere Atlas)_.
