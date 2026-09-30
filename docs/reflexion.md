# Reflexión — EC1 F2 A3

## Ricardo Andres Ayala Limon

## 1. ¿Qué responsabilidad cumple Express y qué responsabilidad conserva el servicio?
Express se encarga de la parte HTTP: recibe las solicitudes, compara el método y la URL con las rutas registradas, lee `req.params` y `req.body`, y devuelve la respuesta con su código de estado. El servicio (`task.service.ts`) conserva las reglas de las tareas: buscar, crear, completar, eliminar y validar que el título no esté vacío. El servicio no sabe nada de `Request` ni `Response`, por eso es independiente de Express. Por ejemplo, `createTask` decide si el título es válido, pero es el controlador quien responde 201.

## 2. ¿Por qué no conviene escribir toda la lógica dentro de task.routes.ts?
Porque `task.routes.ts` solo debe relacionar cada método y URL con su controlador, como `taskRouter.get('/:id', getTask)`. Si ahí también pusiera validaciones, búsquedas en el arreglo y respuestas, el archivo se volvería largo y difícil de leer, y sería más fácil romper algo al modificarlo. Separar ruta, controlador y servicio hace que cada archivo tenga una sola responsabilidad. También permite reutilizar el servicio cuando cambie la forma de guardar los datos.

## 3. ¿Qué diferencia existe entre req.params y req.body?
`req.params` contiene los valores que vienen dentro de la URL, como el `id` en `/api/tasks/3` (ruta `/:id`). Siempre llegan como texto, por eso `parseId` los convierte a número y los valida. `req.body` contiene los datos que el cliente envía en el cuerpo de la solicitud, por ejemplo el JSON `{ "title": "Documentar mi primera API" }` de un POST. Los params identifican a qué recurso me refiero; el body trae la información que se quiere crear o modificar.

## 4. ¿Por qué el título recibido desde un cliente se considera unknown antes de validarlo?
Porque el servidor no controla lo que envía el cliente: en `title` podría llegar un número, un objeto, un arreglo, `null` o nada. Si TypeScript lo tratara como `string` sin revisarlo, podría fallar al llamar `trim()` en tiempo de ejecución. Al declararlo `unknown`, TypeScript me obliga a comprobar `typeof title === 'string'` y que no esté vacío antes de usarlo, como hace `createTask`.

## 5. ¿Qué ventaja ofrece centralizar los errores en un middleware?
Evita repetir en cada controlador la decisión de qué código y qué mensaje responder. Los controladores solo llaman `next(error)` y el `errorHandler` responde de forma uniforme: si es un `AppError` usa su `statusCode` y su mensaje (400, 404), y si es un fallo inesperado responde 500 con un mensaje general, sin exponer detalles internos al cliente. Así todas las respuestas de error tienen el mismo formato `{ "error": "..." }` y es más fácil mantener el código.

## 6. ¿Cuándo debe utilizarse 201 en lugar de 200?
El 201 Created se usa cuando la operación creó un recurso nuevo, como en `POST /api/tasks`, que agrega una tarea con un id nuevo. El 200 OK se usa cuando la solicitud salió bien pero no se creó nada, por ejemplo en un GET o al completar una tarea con PATCH. Usar el código correcto ayuda a que el cliente entienda qué pasó, sin depender solo del JSON.

## 7. ¿Por qué DELETE responde 204 sin un objeto JSON?
Porque 204 No Content significa que la operación fue correcta y que no hay nada que devolver. Después de eliminar, la tarea ya no existe, así que no hay un recurso que mostrar. Por eso en Postman el cuerpo sale vacío, y es el comportamiento correcto. El estado 204 ya le comunica al cliente que la eliminación funcionó.

## 8. ¿Qué ocurrirá con las tareas cuando el servidor se reinicie y por qué?
Las tareas regresarán a su estado inicial (las dos de `data/tasks.ts`). Esto pasa porque los datos están en un arreglo en la memoria del proceso de Node.js, no en un archivo ni en una base de datos. Al detener o reiniciar el servidor, esa memoria se pierde y al arrancar de nuevo el arreglo se crea otra vez con sus valores originales. Las tareas que creé o eliminé durante las pruebas se pierden.

## 9. ¿Qué archivos podrán conservarse cuando se incorpore MongoDB Atlas?
Casi toda la estructura se conserva: `app.ts`, `server.ts`, las rutas, los controladores, los middleware (`errorHandler` y `notFound`), `AppError` y el modelo `Task`. El archivo que dejaría de usarse es `data/tasks.ts` (el arreglo temporal), que se sustituiría por la conexión a la base de datos. El servicio se conservaría como capa, pero sus funciones tendrían que cambiar por dentro para leer y guardar en MongoDB. Esa es la ventaja de haber separado las responsabilidades.

## Dificultades encontradas
Tuve pocas dificultades, y la mayoría fueron con Postman porque era mi primera vez usándolo. Al principio mi POST respondió 400 porque no había configurado el Body como raw → JSON. Además, al final de la prueba del 404 pensé que algo estaba mal, pero entendí que ese era el resultado esperado: después de eliminar la tarea con DELETE, consultarla de nuevo debe responder 404. También tuve un problema al instalar las dependencias con pnpm, que bloqueaba el script de esbuild, y lo resolví aprobando ese build.