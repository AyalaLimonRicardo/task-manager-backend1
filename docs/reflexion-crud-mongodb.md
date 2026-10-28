# Reflexión: CRUD persistente con Express y MongoDB

> Borrador basado en el proyecto. Reescríbelo con tus propias palabras antes de entregarlo.

## 1. ¿Qué operación de Mongoose corresponde a cada letra de CRUD?

Create es `TaskModel.create` (POST). Read es `TaskModel.find` para la lista y `TaskModel.findById` para una tarea (GET). Update es `TaskModel.findByIdAndUpdate` (PATCH). Delete es `TaskModel.findByIdAndDelete` (DELETE).

## 2. ¿Por qué se usa PATCH y no un reemplazo completo del documento?

Porque el cliente puede mandar solo uno o dos campos, por ejemplo `{"status":"completed"}`. Un reemplazo completo (PUT) obligaría a enviar también `title` y `priority`, y si faltan se perderían.

## 3. ¿Qué problema evita `$set`?

Evita sobrescribir los campos que el cliente no envió. `$set` modifica únicamente lo que está en el objeto de cambios, así que `title` se conserva cuando solo se cambia `status`.

## 4. ¿Qué efecto tienen `new: true` y `runValidators: true`?

`new: true` hace que Mongoose devuelva el documento después de actualizarlo; sin eso la respuesta mostraría los datos anteriores. `runValidators: true` aplica las reglas del esquema (enum, longitud máxima) también en actualizaciones, porque Mongoose no las ejecuta por defecto en `findByIdAndUpdate`.

## 5. ¿Por qué un cuerpo vacío debe rechazarse?

Un PATCH sin campos no pide ningún cambio. Aceptarlo respondería 200 sin hacer nada, o solo movería `updatedAt`. Por eso responde 422 con el detalle "Incluye al menos title, status o priority".

## 6. ¿Qué diferencia existe entre `INVALID_ID` y `TASK_NOT_FOUND`?

`INVALID_ID` (400) significa que el texto de la URL no tiene formato de ObjectId, como `/api/tasks/1`. `TASK_NOT_FOUND` (404) significa que el formato es correcto, pero no existe una tarea con ese id.

## 7. ¿Qué responsabilidad cumple `validateTaskUpdate` y cuál cumple `TaskModel`?

`validateTaskUpdate` protege la entrada HTTP: revisa que el cuerpo sea un objeto, rechaza campos desconocidos y construye un `TaskUpdate` limpio antes de consultar Mongo. `TaskModel` es la segunda barrera: aplica las reglas del esquema a cualquier código que use Mongoose, aunque no pase por esa ruta.

## 8. ¿Cómo llega un error de `updateTask` al `errorHandler` de Express 5?

`updateTask` lanza un `AppError` (por ejemplo `TASK_NOT_FOUND`) dentro de una función asíncrona. El controlador `patchTask` lo espera con `await`, la promesa se rechaza y Express 5 lo envía al último middleware, el `errorHandler`, que responde con `code`, `message`, `details` y `requestId`.

## 9. ¿Por qué DELETE responde 204 sin cuerpo?

Porque la eliminación se hizo y no hay un recurso que devolver. 204 significa "éxito sin contenido"; por eso el controlador usa `res.status(204).send()` y no `json`.

## 10. ¿Qué prueba demuestra que el CRUD es persistente y no solo funcional en memoria?

Crear una tarea y cambiar su título, detener la API con Ctrl+C, iniciarla otra vez y consultar el mismo id: el título actualizado sigue ahí. Además se puede ver el documento en Atlas Data Explorer, que no depende del proceso de Node.js.

## Desafío: campo `priority`

Se agregó `priority` (`low`, `medium` o `high`, predeterminado `medium`) al tipo, al esquema, a la validación de POST y de PATCH y a la respuesta. Los archivos cambiados y el motivo de cada uno están en `docs/pruebas-crud-mongodb.md`.
