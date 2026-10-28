# Pruebas del CRUD persistente

## Entorno

- Rama: act-6
- Base: task_api
- Colección: tasks
- Resultado de pnpm check: correcto, sin errores de TypeScript.
- Resultado de pnpm build: correcto; `dist/middlewares/validate-task-update.middleware.js` existe.

## Recurso de prueba

- id devuelto por POST: _(pega aquí el data.id)_
- title inicial: Preparar evidencia del CRUD
- title final: Revisar evidencias
- status final: _(el que muestre tu última consulta)_
- Persistencia después de reiniciar: _(escribe si el título actualizado reapareció)_

## Cómo ejecutar

Importa `docs/EC2_F2_A7_CRUD.postman_collection.json` en Postman y ejecútala con el Runner, en orden y con la API corriendo.
Cada solicitud trae sus pruebas automáticas y guarda `taskId` por sí sola.

## Casos ejecutados

"Sí" indica que el caso se comprobó sin base de datos con un script de humo sobre `dist/app.js`.
Los demás requieren Atlas: complétalos con tus resultados reales. Sustituye cualquier dato sensible por [OCULTO].

| Tipo | Método y ruta | Datos | Esperado | Obtenido | requestId | Resultado |
|---|---|---|---|---|---|---|
| Positiva | POST /api/tasks | {"title":"Tarea"} | 201 | | | |
| Positiva | GET /api/tasks | Sin cuerpo | 200 | | | |
| Positiva | GET /api/tasks/:id | Sin cuerpo | 200 | | | |
| Positiva | PATCH /api/tasks/:id | {"title":"Nuevo"} | 200, status no cambia | | | |
| Positiva | PATCH /api/tasks/:id | {"status":"completed"} | 200, title no cambia | | | |
| Positiva | PATCH /api/tasks/:id | title, status y priority | 200, updatedAt cambia | | | |
| Regresión | PATCH /api/tasks/:id/complete | Sin cuerpo | 200 | | | |
| Positiva | DELETE /api/tasks/:id | Sin cuerpo | 204 | | | |
| Negativa | GET /api/tasks/:id tras borrar | Sin cuerpo | 404 TASK_NOT_FOUND | | | |
| Negativa | PATCH /api/tasks/1 | {"title":"x"} | 400 INVALID_ID | 400 INVALID_ID | presente | Sí |
| Negativa | PATCH ObjectId inexistente | {"title":"x"} | 404 TASK_NOT_FOUND | | | |
| Negativa | PATCH /api/tasks/:id | sin application/json | 415 UNSUPPORTED_MEDIA_TYPE | 415 UNSUPPORTED_MEDIA_TYPE | presente | Sí |
| Negativa | PATCH /api/tasks/:id | JSON mal formado | 400 INVALID_JSON | 400 INVALID_JSON | presente | Sí |
| Negativa | PATCH /api/tasks/:id | {} | 422 VALIDATION_ERROR | 422 VALIDATION_ERROR | presente | Sí |
| Negativa | PATCH /api/tasks/:id | [] | 422 VALIDATION_ERROR | 422 VALIDATION_ERROR | presente | Sí |
| Negativa | PATCH /api/tasks/:id | {"title":"   "} | 422 (field title) | 422 (field title) | presente | Sí |
| Negativa | PATCH /api/tasks/:id | title de 121 caracteres | 422 (field title) | 422 (field title) | presente | Sí |
| Negativa | PATCH /api/tasks/:id | {"status":"archived"} | 422 (field status) | 422 (field status) | presente | Sí |
| Negativa | PATCH /api/tasks/:id | {"owner":"Ana"} | 422 (field owner) | 422 (field owner) | presente | Sí |
| Negativa | PATCH /api/tasks/:id | {"createdAt":"x"} | 422 (field createdAt) | 422 (field createdAt) | presente | Sí |
| Negativa | GET /api/tasks | Atlas no disponible | 503 DATABASE_UNAVAILABLE | 503 DATABASE_UNAVAILABLE | presente | Sí |
| Desafío | POST /api/tasks | sin priority | 201, priority medium | | | |
| Desafío | POST /api/tasks | priority high | 201, priority high | | | |
| Desafío | PATCH /api/tasks/:id | {"priority":"low"} | 200, priority low | | | |
| Desafío | PATCH /api/tasks/:id | {"priority":"urgent"} | 422 (field priority) | 422 (field priority) | presente | Sí |
| Desafío | POST /api/tasks | {"priority":"urgent"} | 422 (field priority) | 422 (field priority) | presente | Sí |

Comprobación adicional sin base de datos: `new TaskModel({ title })` queda con `status: pending` y `priority: medium`, y el esquema rechaza `priority` y `status` desconocidos.

## Evidencias

1. Compilación correcta (pnpm check y pnpm build).
2. Documento antes y después de PATCH en Atlas. _(adjunta captura sin URI ni usuario)_
3. Respuesta 204 sin cuerpo al eliminar. _(adjunta captura)_
4. Error de validación con requestId. _(adjunta captura)_
5. Consulta después de reiniciar. _(adjunta captura)_

## Desafío individual: campo `priority`

Valores permitidos: `low`, `medium` y `high`. Es opcional en POST y PATCH y su valor predeterminado es `medium`.

| Archivo | Cambio | Motivo |
|---|---|---|
| `src/models/task.ts` | `TASK_PRIORITIES`, `TaskPriority`, `priority` en `TaskPersistence`, `Task` y `TaskUpdate`, y en el esquema con `enum` y `default: 'medium'` | Fuente única de valores, protección en Mongoose y respuesta pública |
| `src/middlewares/validate-task-priority.middleware.ts` | Nuevo; valida `priority` opcional en POST | Rechaza con 422 y detalle `priority` antes del servicio |
| `src/middlewares/validate-task-update.middleware.ts` | Agrega `priority` a los campos permitidos y valida su valor | Permite modificarla con PATCH /:id |
| `src/services/task.service.ts` | `NewTask`, `toTask` devuelve `priority` y `createTask` la guarda | Persistencia en Atlas |
| `src/controllers/task.controller.ts` | `postTask` pasa `priority` al servicio | Conectar la validación con el servicio |
| `src/routes/task.routes.ts` | POST usa `validateTaskPriority` | Sin ruta nueva |

Las tareas anteriores sin `priority` no se rompen: Mongoose aplica el valor predeterminado `medium` al leerlas.
