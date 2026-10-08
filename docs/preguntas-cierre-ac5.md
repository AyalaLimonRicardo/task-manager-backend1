# Reflexión — EC2 F1 A5

## Ricardo Andres Ayala Limon

## 1. ¿Qué diferencia existe entre tu cuenta de Atlas y el usuario de base de datos?
Mi cuenta de Atlas sirve para administrar la plataforma: crear proyectos y clústeres, configurar la lista de acceso de red y crear usuarios. El usuario de base de datos (`task_api_user`) es una cuenta distinta, que solo usa la API para autenticarse y leer o escribir datos. Además, tiene el permiso `readWrite` únicamente sobre la base `task_api`. Si ese usuario se filtrara, el daño sería limitado, porque no puede administrar el clúster ni acceder a otras bases.

## 2. ¿Por qué MONGODB_URI se considera un secreto aunque el repositorio sea privado?
Porque la URI contiene el usuario y la contraseña, y con ellas cualquiera podría acceder a la base de datos. Un repositorio privado puede dejar de serlo, otras personas pueden tener acceso a él, y el historial de Git conserva lo que se subió aunque después se borre el archivo. Por eso `.env` está en `.gitignore`, y en el repositorio solo va `.env.example`, que no tiene datos reales. Si un secreto se publica, hay que cambiar la contraseña en Atlas, y un commit posterior no lo vuelve seguro.

## 3. ¿Qué riesgo introduce permitir 0.0.0.0/0 en la lista de acceso?
Permite que cualquier dirección de Internet intente conectarse al clúster. Entonces la contraseña queda como la única defensa, y se expone a intentos de fuerza bruta o a que alguien use una credencial filtrada. Con la IP de mi equipo (`/32`) solo ese equipo puede intentar conectarse, y por eso la guía pide evitar `0.0.0.0/0`, incluso cuando algo falla.

## 4. ¿Por qué la API espera connectDatabase antes de ejecutar app.listen?
Porque una API que acepta solicitudes sin poder usar su base de datos engañaría al cliente: parecería disponible, pero fallaría al intentar guardar o consultar datos. Con `await connectDatabase(...)` antes de `app.listen`, el puerto solo se abre cuando la conexión con Atlas ya está confirmada. Si la conexión falla, la API no arranca, muestra un mensaje seguro y termina con un código de salida fallido.

## 5. ¿Qué comprueba readyState y qué añade el comando ping?
`readyState` indica el estado de la conexión que Mongoose tiene registrado en mi aplicación, y el valor `1` significa que cree estar conectado. Pero eso es una información local. El `ping` va más allá, porque envía una operación real al servidor de MongoDB y comprueba que responde en ese momento. Por eso `checkDatabaseHealth` usa las dos comprobaciones: primero el estado y después el ping.

## 6. ¿Por qué una falla de MongoDB corresponde a infraestructura y no a validación HTTP?
Porque en ese caso el cliente envió una solicitud correcta, y el problema es que una dependencia del servidor (la base de datos) no está disponible. Una validación HTTP, como `INVALID_ID` o `VALIDATION_ERROR`, indica que el cliente mandó algo incorrecto y que debe corregirlo. En cambio, el cliente no puede arreglar una base de datos caída. Por eso responde 503 con `DATABASE_UNAVAILABLE`, y no 400 ni 422.

## 7. ¿Cómo llega un AppError lanzado por getDatabaseHealth al manejador central en Express 5?
`getDatabaseHealth` es una función `async`. Cuando `checkDatabaseHealth` lanza un `AppError`, la promesa de esa función se rechaza. Express 5 detecta esa promesa rechazada y llama automáticamente a `next(error)`, sin que yo escriba un `try/catch`. Como el `errorHandler` está registrado al final, recibe el error y lo convierte en una respuesta 503 con la estructura uniforme (`code`, `message` y `requestId`). En Express 4 esto no pasaba solo.

## 8. ¿Qué pruebas demuestran que la incorporación de Atlas no rompió la API anterior?
Las pruebas de regresión en Postman. Con la conexión activa, ejecuté en orden POST, GET por id, PATCH `/complete`, DELETE y un GET final, y obtuve 201, 200, 200, 204 y 404. Además, repetí las pruebas negativas: `GET /api/tasks/abc` responde 400 `INVALID_ID`, `GET /api/tasks/999` responde 404 `TASK_NOT_FOUND`, el POST sin JSON responde 415 y el título vacío responde 422. También comprobé que `pnpm check` y `pnpm build` terminan sin errores.

## 9. ¿Por qué el arreglo en memoria se conserva todavía en esta actividad?
Porque el objetivo de esta actividad es solo la infraestructura: configurar Atlas, proteger las credenciales, conectar Express y comprobar la disponibilidad. Si cambiara ahora `task.service.ts` o el modelo `Task`, mezclaría este objetivo con el del modelado de datos de la siguiente actividad, y sería más difícil saber de dónde viene un error. Al conservar el arreglo, puedo comprobar que el CRUD sigue funcionando igual. Eso sí, al reiniciar la API las tareas vuelven a su estado inicial, y es el resultado esperado.

## 10. ¿Qué información debe ocultarse al cliente cuando ocurre un error de conexión?
No debe enviarse la URI, la contraseña, el nombre del host ni el usuario, y tampoco el stack ni el objeto de error original de Mongoose, porque pueden revelar la infraestructura. El cliente solo recibe un mensaje general, como `La base de datos no está disponible.`, con el código `DATABASE_UNAVAILABLE`. En el arranque ocurre lo mismo: la terminal muestra solo un mensaje seguro que orienta la revisión, sin imprimir la cadena de conexión.

## Dificultades encontradas
Al principio la API no conectaba y mostraba solo el mensaje general de inicio, que no decía la causa. Agregué temporalmente una línea de diagnóstico que imprimía el nombre y el mensaje del error, y apareció `querySrv ECONNREFUSED`. Eso indicaba que mi red rechazaba la consulta DNS de tipo SRV que usa la cadena `mongodb+srv://`, y que el problema no era la contraseña ni la lista de acceso. Lo resolví activando la opción **Legacy URI String** en Atlas, que da una cadena `mongodb://` con los hosts escritos directamente. Después de eso la API conectó, y retiré la línea de diagnóstico. También tuve que crear `.gitignore` y `.env.example`, que no estaban en mi proyecto, para proteger el `.env`.