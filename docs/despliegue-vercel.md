# Despliegue del Backend en Vercel

## Cómo lo detecta Vercel
- `src/app.ts` importa `express` y exporta la aplicación por defecto: Vercel la ejecuta como una función.
- `src/server.ts` (con `app.listen`) solo se usa en local con `pnpm dev`.

## Variables (Settings → Environment Variables → Production)
| Variable | Valor |
|---|---|
| NODE_ENV | production (Vercel ya la define) |
| APP_VERSION | 1.0.0 |
| PUBLIC_API_URL | https://BACKEND.vercel.app |
| TRUST_PROXY_HOPS | 1 |
| MONGODB_URI | cadena de Atlas (marcar como Sensitive) |
| MONGODB_DB_NAME | task_api |
| JWT_SECRET | secreto aleatorio ≥ 32 bytes (Sensitive) |
| JWT_EXPIRES_IN / JWT_ISSUER / JWT_AUDIENCE | 1h / task-api-express / task-api-client |
| CORS_ORIGIN | https://FRONTEND.vercel.app (sin ruta ni diagonal final) |
| AUTH_RATE_LIMIT_WINDOW_MS / AUTH_RATE_LIMIT_MAX | 900000 / 10 |

Todas deben existir antes del primer despliegue: sin ellas `env.ts` detiene el arranque.

## MongoDB Atlas
Vercel usa IP de salida dinámicas. En el plan Hobby hay que permitir `0.0.0.0/0` en Network Access;
reduce el riesgo con un usuario de base de datos limitado a `task_api` y una contraseña larga.
Las IP fijas (Static IPs) solo existen en los planes Pro y Enterprise.

## Límite de intentos
`express-rate-limit` guarda los contadores en memoria de cada instancia; en Vercel puede haber
varias, así que el límite es aproximado.

## Pruebas posteriores
```powershell
$env:API_URL = "https://BACKEND.vercel.app"
$env:USER_EMAIL = "correo@ejemplo.com"
$env:USER_PASSWORD = "tu contraseña"
pnpm smoke:release
Remove-Item Env:USER_PASSWORD
```
