# Evidencias EC3 F1 A9

## Datos generales

- Nombre: _(tu nombre)_
- Grupo: _(tu grupo)_
- Repositorio y rama: _(tu repositorio; la guía sugiere la rama `ec3-a9-auth`)_
- Commit final: _(hash de tu commit)_

## Entorno verificado

- `node --version`: v22.23.5
- `pnpm --version`: 10.28.0
- `pnpm check`: aprobado
- `pnpm build`: aprobado
- `GET /health/database`: _pendiente: ejecútalo con tu clúster de Atlas (código y estado)_

> Las pruebas de abajo se ejecutaron sobre `dist/app.js` con los métodos de Mongoose sustituidos por un almacén en memoria
> (no hubo conexión con Atlas). El hash bcrypt, el JWT, las validaciones y los errores son los reales del proyecto.
> Repite los casos con Postman y tu clúster para completar la evidencia con capturas.

## Registro

- Solicitud utilizada, con contraseña reemplazada por `<OCULTA>`: `POST /api/auth/register` con `{"name":"Ana Torres","email":"Ana.Torres@Example.com","password":"<OCULTA>"}`
- Código HTTP: 201
- Respuesta sin datos sensibles: `data.user` con `id`, `name`, `email`, `role: "user"`, `createdAt` y `updatedAt`
- Comprobación de que no aparece `passwordHash`: la respuesta no contiene `password` ni `passwordHash`; el correo se guardó en minúsculas (`ana.torres@example.com`)
- En el almacenamiento, `passwordHash` empieza con `$2b$12$` (bcrypt, 12 rondas) y no coincide con la contraseña. _(En Atlas: confirma el prefijo bcrypt sin copiar el hash completo.)_

## Inicio de sesión

- Solicitud, con contraseña reemplazada por `<OCULTA>`: `POST /api/auth/login` con `{"email":"ana.torres@example.com","password":"<OCULTA>"}`
- Código HTTP: 200
- Campos recibidos (token reemplazado por `<TOKEN_OCULTO>`): `data.user`, `data.accessToken: "<TOKEN_OCULTO>"`, `data.tokenType: "Bearer"`, `data.expiresIn: "1h"`
- Claims observados sin copiar el token: `sub` (id del usuario), `role: "user"`, `iss: "task-api-express"`, `aud: "task-api-client"`, `iat` y `exp`. No contiene contraseña, hash, nombre ni correo.

## Pruebas negativas

| Caso | Código esperado | Código obtenido | `error.code` | Resultado |
|---|---:|---:|---|---|
| Correo repetido | 409 | 409 | USER_EMAIL_EXISTS | Sí |
| Contraseña corta | 422 | 422 | AUTH_VALIDATION_ERROR | Sí |
| Contraseña de más de 72 bytes | 422 | 422 | AUTH_VALIDATION_ERROR | Sí |
| Correo inválido | 422 | 422 | AUTH_VALIDATION_ERROR | Sí |
| Campo `role` | 422 | 422 | AUTH_VALIDATION_ERROR (`details.field` = role) | Sí |
| Campo `passwordHash` | 422 | 422 | AUTH_VALIDATION_ERROR | Sí |
| Credenciales incorrectas (contraseña) | 401 | 401 | INVALID_CREDENTIALS | Sí |
| Credenciales incorrectas (correo inexistente) | 401 | 401 | INVALID_CREDENTIALS (mismo mensaje) | Sí |
| Content-Type incorrecto | 415 | 415 | UNSUPPORTED_MEDIA_TYPE | Sí |
| JSON inválido | 400 | 400 | INVALID_JSON | Sí |

Al intentar registrar con `role: "admin"` no se creó ningún usuario.

## Regresión de tareas

Ejecutada con el módulo de A10 ya activo (con token); el comportamiento de A8 no cambió.

- Crear: 201
- Listar con paginación y filtros (`?page=1&limit=2`, `?status=completed`, `?search=api`, `?sortBy=title&order=asc`): 200 con `data` y `meta`
- Actualizar: 200
- Completar: 200
- Eliminar: 204 (solo admin, ver `evidencias/ec3-a10.md`)

> En A9 las rutas de tareas todavía eran públicas; A10 las protegió. Por eso la regresión actual lleva `Authorization`.

## Seguridad observada

- ¿La colección guarda `password` o solo `passwordHash`? Solo `passwordHash` (hash bcrypt con sal aleatoria). No existe un campo `password`.
- ¿Alguna respuesta expone `passwordHash`, URI, secreto o stack trace? No. Los errores inesperados responden con un mensaje genérico y `requestId`.
- ¿El cliente puede asignarse `admin`? No: `role` no está en la lista de campos permitidos y el servicio siempre crea `role: "user"`.

## Conclusión

Se comprobó que el registro guarda únicamente un hash bcrypt, que el login emite un JWT HS256 con `sub`, `role`, emisor, audiencia y expiración, y que el login no distingue entre correo inexistente y contraseña incorrecta.
El CRUD y las consultas de A8 siguen funcionando.
Quedó pendiente para A10 exigir el token en las rutas de tareas y aplicar permisos por rol; también falta repetir estas pruebas contra Atlas y adjuntar capturas con token, contraseña y URI ocultos.
