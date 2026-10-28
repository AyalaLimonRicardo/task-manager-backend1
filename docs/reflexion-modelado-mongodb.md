# Reflexión: modelado de documentos en MongoDB

> Borrador basado en el proyecto. Reescríbelo con tus propias palabras antes de entregarlo.

## 1. ¿Qué diferencia existe entre un documento, un esquema y un modelo?

Un documento es un registro guardado en la colección `tasks`, por ejemplo una tarea con su `_id`, `title` y `status`. El esquema (`taskSchema`) es el conjunto de reglas que dice cómo debe verse ese documento: título obligatorio, máximo 120 caracteres y `status` solo `pending` o `completed`. El modelo (`TaskModel`) es la herramienta que usa el servicio para crear, buscar, actualizar y borrar documentos aplicando esas reglas.

## 2. ¿Por qué la API devuelve `id` en lugar de `_id`?

`_id` es un detalle interno de MongoDB y su tipo es ObjectId. La función `toTask` lo convierte a un `id` de texto para que el cliente reciba una respuesta simple y no dependa de la estructura de la base de datos.

## 3. ¿Qué problema evita migrar todas las operaciones a una sola fuente de datos?

Evita tener dos fuentes de verdad. Si POST y GET usaran Atlas pero PATCH y DELETE el arreglo en memoria, una tarea creada no se podría completar ni borrar, porque no existiría en el arreglo.

## 4. ¿Qué reglas aplica el middleware y cuáles repite el esquema?

El middleware rechaza la petición HTTP antes de llegar al servicio: `title` no vacío y de máximo 120 caracteres, `description` opcional de máximo 300, y el formato del ObjectId. El esquema repite los límites de longitud y la lista de estados, porque protege a la base de datos aunque otra parte del código use `TaskModel` sin pasar por la ruta.

## 5. ¿Qué diferencia existe entre `INVALID_ID` y `TASK_NOT_FOUND`?

`INVALID_ID` (400) significa que el texto de la URL ni siquiera tiene formato de ObjectId, como `/api/tasks/1`. `TASK_NOT_FOUND` (404) significa que el formato es correcto, pero no hay ninguna tarea con ese id.

## 6. ¿Qué hacen `timestamps` y `versionKey: false`?

`timestamps: true` hace que Mongoose llene y actualice `createdAt` y `updatedAt` automáticamente. `versionKey: false` evita el campo interno `__v`, porque esta API todavía no controla versiones de documentos.

## 7. ¿Por qué los controladores deben usar `async` y `await`?

Las operaciones de Mongoose devuelven promesas. Sin `await`, el controlador respondería antes de que la base de datos termine y enviaría una `Promise` en lugar de los datos.

## 8. ¿Cómo llega un `AppError` asíncrono al `errorHandler` de Express 5?

En Express 5, si una función asíncrona lanza un error o su promesa se rechaza, Express lo captura y lo manda al manejador de errores registrado al final de `app.ts`. Por eso los controladores no necesitan `try/catch` ni llamar a `next(error)`.

## 9. ¿Qué prueba demuestra realmente que una tarea es persistente?

Crear una tarea, detener la API con Ctrl+C, iniciarla de nuevo y comprobar que `GET /api/tasks` todavía la devuelve. Un arreglo en memoria se perdería al reiniciar Node.js.

## 10. ¿Qué información de Mongoose o Atlas nunca debe aparecer en la respuesta HTTP?

La URI de conexión, el usuario y la contraseña, los nombres de servidores del clúster, los stack traces, los objetos de error completos de Mongoose, y los campos internos `_id` y `__v`.

## Desafío: campo opcional `description`

Se agregó `description` al modelo (opcional, `trim`, máximo 300), a un middleware nuevo `validate-task-description.middleware.ts` que responde `422 VALIDATION_ERROR` con `field: "description"`, al servicio y a la respuesta pública, que solo incluye el campo cuando existe. Una tarea sin `description` sigue siendo válida.
