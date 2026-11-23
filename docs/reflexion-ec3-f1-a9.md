# Reflexión EC3 F1 A9

## 1. ¿Por qué un hash de contraseña no debe poder descifrarse?

Un hash es una transformación de un solo sentido: no existe una operación inversa. Si la base de datos se filtra, el atacante solo obtiene hashes y no las contraseñas.
Cifrar (que sí se puede revertir con una clave) obligaría a proteger esa clave y permitiría recuperar las contraseñas. Con el hash, el sistema nunca necesita conocer la contraseña: solo compara.

## 2. ¿Qué diferencia existe entre una sal aleatoria y la clave usada para firmar HS256?

La sal la genera bcrypt para cada contraseña y se guarda dentro del propio hash; no es secreta, sirve para que dos contraseñas iguales produzcan hashes distintos y para frenar tablas precalculadas.
`JWT_SECRET` es una clave secreta única de la API que solo conoce el servidor: se usa para firmar y verificar tokens. Si se filtra, cualquiera podría fabricar tokens válidos.

## 3. ¿Por qué `passwordHash` tiene `select: false` y aun así el login puede recuperarlo?

`select: false` hace que Mongoose no incluya ese campo en consultas normales, para que no salga por accidente en una respuesta.
El login lo necesita para comparar, así que `findUserDocumentByEmail(email, true)` usa `select('+passwordHash')` solo en esa consulta. Después `toUser` construye la salida pública sin ese campo.

## 4. ¿Por qué `unique` no sustituye la validación HTTP del correo?

`unique` crea un índice que evita correos duplicados, pero no comprueba que el texto sea un correo ni su longitud, y su error llega tarde (11000 desde MongoDB).
El middleware valida formato, normaliza (`trim` y minúsculas) y rechaza campos desconocidos antes de llegar al servicio. El índice sigue siendo la protección definitiva contra dos registros simultáneos (condición de carrera) y el repositorio traduce ese error a 409.

## 5. ¿Qué riesgo evita rechazar el campo `role` durante el registro?

Evita la asignación masiva (mass assignment): si el cliente pudiera enviar `role: "admin"`, cualquiera se daría permisos de administrador.
Por eso `role` no está en la lista permitida (responde 422) y el servicio siempre crea al usuario con `role: "user"`.

## 6. ¿Por qué correo inexistente y contraseña incorrecta devuelven el mismo mensaje?

Si los mensajes fueran distintos, un atacante podría descubrir qué correos tienen cuenta (enumeración de usuarios).
Ambos casos devuelven 401 `INVALID_CREDENTIALS` con el mismo texto. Además, cuando el correo no existe se compara contra un hash ficticio para que el tiempo de respuesta no delate la diferencia.

## 7. ¿Qué información contiene el JWT de esta actividad y qué información se excluye?

Contiene `sub` (id del usuario), `role`, `iss` (emisor), `aud` (audiencia), `iat` (emisión) y `exp` (expiración).
Se excluyen contraseña, hash, nombre y correo. Los claims de un JWT firmado se pueden leer por cualquiera que tenga el token (la firma protege la integridad, no oculta el contenido).

## 8. ¿Qué validan `issuer`, `audience`, `algorithms` y `exp`?

- `issuer`: que el token lo haya emitido esta API (`task-api-express`).
- `audience`: que el token sea para este cliente (`task-api-client`) y no para otro sistema.
- `algorithms`: que solo se acepte HS256, evitando que se use otro algoritmo (por ejemplo `none`).
- `exp`: que no haya caducado (1 hora por defecto).

`jwtVerify` también comprueba la firma. En las pruebas, un token expirado, con otra audiencia, otro emisor, otra clave o un payload alterado respondió 401 `INVALID_TOKEN`.

## 9. ¿Cómo llega un error de MongoDB desde el repositorio hasta `errorHandler` en Express 5?

El repositorio de usuarios ejecuta cada operación dentro de `execute`, que atrapa el error de Mongoose y lo convierte en `AppError` (409 por correo duplicado, 422 por validación, 503 `DATABASE_UNAVAILABLE` por cualquier otro fallo, sin detalles internos).
El servicio y el controlador son `async` y usan `await`, por lo que la promesa rechazada sube al manejador de la ruta. Express 5 la detecta y llama a `next(error)` por sí solo; no se usa `try/catch` en el controlador.
Finalmente `errorHandler` responde con `code`, `message`, `details` y `requestId`.

## 10. ¿Por qué las rutas de tareas permanecen públicas en A9 y qué cambiará en A10?

En A9 el objetivo era separar la creación del token de su uso: primero se aprende a registrar usuarios, proteger contraseñas y emitir el JWT, sin tocar el CRUD que ya funcionaba.
En A10 se agrega el middleware `authenticate`, que lee `Authorization: Bearer <token>`, verifica el JWT con `verifyAccessToken` y deja la identidad en `res.locals.auth`; todo `/api/tasks` exigirá token y `DELETE` además exigirá rol `admin`.
