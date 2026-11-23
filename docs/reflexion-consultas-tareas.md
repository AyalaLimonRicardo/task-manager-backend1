# Reflexión: consultas de tareas (EC2 F3 A8)

## 1. ¿Qué responsabilidad nueva cumple `task.repository.ts`?

Concentra todo el acceso a MongoDB mediante Mongoose: `find`, `countDocuments`, `findById`, `create`, `findByIdAndUpdate` y `findByIdAndDelete`.
También traduce los errores técnicos (validación de Mongoose, fallos de conexión) a `AppError` con código `PERSISTENCE_VALIDATION_ERROR` o `DATABASE_UNAVAILABLE`.
Antes de A8 el servicio hacía eso directamente; ahora `task.service.ts` ya no importa `TaskModel` y solo aplica reglas del módulo (por ejemplo, decidir que una ausencia es `TASK_NOT_FOUND`).

## 2. ¿Por qué el middleware debe validar `req.query` antes del controlador?

Porque los parámetros vienen de la URL y no son confiables: Express los entrega como texto, arreglo u objeto.
El middleware los convierte en un `TaskListQuery` ya tipado y limpio; así el controlador no interpreta cadenas y el repositorio nunca recibe un valor arbitrario.
Si la URL es inválida (`?page=0`), se responde 422 `QUERY_VALIDATION_ERROR` sin consultar Atlas, y no se confunde con un fallo de base de datos (503).

## 3. ¿Cómo se calcula `skip` para una página determinada?

`skip = (page - 1) * limit`. Con `limit=2`, la página 1 salta 0 documentos, la página 2 salta 2 y la página 3 salta 4.
Primero se aplica `skip` y luego `limit`, sobre un orden definido.

## 4. ¿Por qué `find` y `countDocuments` deben usar el mismo filtro?

Porque `meta.total` debe describir el mismo conjunto del que sale `data`.
Si `countDocuments` ignorara el filtro, con `status=completed` los datos serían 2 tareas pero `total` seguiría en 5 y `totalPages` sería incorrecto.
Por eso `findTaskDocuments` construye `filter` una sola vez y lo pasa a ambas consultas.

## 5. ¿Qué problema evita `escapeRegex`?

La búsqueda usa una expresión regular. Sin escapar, un cliente podría enviar `search=.*` y el patrón coincidiría con todos los títulos, o enviar un patrón costoso o malformado.
`escapeRegex` convierte los metacaracteres (`. * + ? ^ $ { } ( ) | [ ] \`) en texto literal, de modo que `.*` solo busca esos dos caracteres.
En las pruebas, `search=.*` devolvió total 0 y el repositorio generó `/\.\*/i`.

## 6. ¿Por qué `sortBy` utiliza una lista permitida?

`sortBy` termina siendo el nombre de un campo en `sort()`. Si se usara directamente el valor de la URL, el cliente podría ordenar por campos internos o inexistentes.
La lista cerrada `TASK_SORT_FIELDS` (`createdAt`, `updatedAt`, `title`, `status`) y la función `isTaskSortField` aseguran que solo llegue un campo conocido; cualquier otro (`priority`) responde 422.
Además se agrega `_id` como segundo criterio para que el orden sea estable cuando dos documentos empatan y las páginas no repitan tareas.

## 7. ¿Qué diferencia existe entre `data.length`, `meta.total` y `meta.totalPages`?

- `data.length`: cuántas tareas trae esta página (como máximo `limit`).
- `meta.total`: cuántas tareas cumplen el filtro en toda la colección.
- `meta.totalPages`: `Math.ceil(total / limit)`, cuántas páginas hay.

Ejemplo con 5 tareas y `limit=2`: la página 3 tiene `data.length` 1, `total` 5 y `totalPages` 3.

## 8. ¿Cómo llega un error asíncrono del repositorio al `errorHandler` de Express 5?

El repositorio envuelve cada operación en `execute`, que captura el error de Mongoose y lo relanza como `AppError`.
Como el servicio y el controlador son funciones `async` y se esperan con `await`, la promesa se rechaza y sube hasta la ruta.
Express 5 detecta la promesa rechazada del manejador y llama a `next(error)` automáticamente, por lo que no hace falta `try/catch` en el controlador.
El `errorHandler`, registrado al final de `app.ts`, responde con `code`, `message`, `details` y `requestId`.

## 9. ¿Qué prueba demuestra que A8 no rompió el CRUD de A7?

La repetición de las rutas heredadas: POST 201, GET por id 200, PATCH general 200, PATCH de completar 200 y DELETE 204; además, GET de un id eliminado devuelve 404 `TASK_NOT_FOUND` y un id inválido 400 `INVALID_ID`.
También se comprobó que las respuestas siguen sin `_id` ni `__v` y que el listado sin parámetros conserva el orden `createdAt asc`.

## 10. ¿Qué limitación tiene la paginación basada en `skip` cuando la colección crece mucho?

Para saltar `skip` documentos MongoDB tiene que recorrerlos igualmente, así que las páginas lejanas son cada vez más lentas.
Además, si se insertan o eliminan tareas mientras el usuario navega, los documentos pueden repetirse u omitirse entre páginas.
Con colecciones grandes conviene paginar por cursor (por ejemplo, usando `_id` o `createdAt` del último elemento) en lugar de `skip`.
