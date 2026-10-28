# Pruebas de modelado y persistencia

## Entorno

- Rama: feature/modelo-tareas-mongodb
- Base: task_api
- Colección: tasks
- Resultado de pnpm check: correcto, sin errores de TypeScript.
- Resultado de pnpm build: correcto, `dist` generado.

## Documento comprobado

- id devuelto por la API: _(pega aquí el data.id de tu POST)_
- Campos observados en Atlas: _(title, status, _id, createdAt, updatedAt; description si la enviaste)_
- Resultado después de reiniciar: _(escribe si la tarea siguió apareciendo)_

## Casos ejecutados

Las filas marcadas con "Sí" se comprobaron sin base de datos con un script de humo sobre `dist/app.js`.
Las demás requieren Atlas: ejecútalas en Postman y completa las columnas vacías. Sustituye cualquier host, usuario o secreto por [OCULTO].

| Tipo | Método y ruta | Datos | Esperado | Obtenido | requestId | Resultado |
|---|---|---|---|---|---|---|
| Salud | GET /health | No aplica | 200 | 200 | No aplica | Sí |
| Salud | GET /health/database | No aplica | 200 connected | | | |
| Persistencia | POST /api/tasks | title válido | 201 | | | |
| Persistencia | GET /api/tasks | No aplica | 200 | | | |
| Persistencia | GET /api/tasks/{{taskId}} | No aplica | 200 | | | |
| Persistencia | Reinicio + GET /api/tasks | No aplica | 200, la tarea permanece | | | |
| Regresión | PATCH /api/tasks/{{taskId}}/complete | No aplica | 200 completed | | | |
| Regresión | DELETE /api/tasks/{{taskId}} | No aplica | 204 | | | |
| Regresión | GET /api/tasks/{{taskId}} tras borrar | No aplica | 404 TASK_NOT_FOUND | | | |
| Negativa | GET /api/tasks/1 | No aplica | 400 INVALID_ID | 400 INVALID_ID | presente | Sí |
| Negativa | GET ObjectId válido inexistente | No aplica | 404 TASK_NOT_FOUND | | | |
| Negativa | POST /api/tasks | title vacío | 422 VALIDATION_ERROR | 422 VALIDATION_ERROR | presente | Sí |
| Negativa | POST /api/tasks | title de 121 caracteres | 422 VALIDATION_ERROR | 422 VALIDATION_ERROR | presente | Sí |
| Negativa | POST /api/tasks | raw Text | 415 UNSUPPORTED_MEDIA_TYPE | 415 UNSUPPORTED_MEDIA_TYPE | presente | Sí |
| Desafío | POST /api/tasks | description de 301 caracteres | 422 VALIDATION_ERROR (field description) | 422 VALIDATION_ERROR | presente | Sí |
| Desafío | POST /api/tasks | title válido sin description | 201 | | | |
| Desafío | POST /api/tasks | title y description válidos | 201 con description | | | |
| Infraestructura | Arranque | Contraseña incorrecta | El puerto no abre, mensaje seguro | | | |

## Evidencias

1. Compilación correcta (pnpm check y pnpm build).
2. POST y documento visible en Atlas sin credenciales. _(adjunta captura)_
3. Consulta después de reiniciar. _(adjunta captura)_
4. Un error HTTP (415), una regla del negocio (404 TASK_NOT_FOUND) y una falla de infraestructura (arranque con contraseña incorrecta).
