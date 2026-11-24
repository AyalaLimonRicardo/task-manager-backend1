# Historial de cambios

## [1.0.0] - AAAA-MM-DD

### Agregado
- Configuración por ambiente: `NODE_ENV`, `APP_VERSION`, `PUBLIC_API_URL` y `TRUST_PROXY_HOPS`.
- Conexión a MongoDB bajo demanda y reutilizable para ejecutarse en Vercel (`ensureDatabase`).
- `/health` informa versión y ambiente; OpenAPI toma versión y servidor del ambiente.
- Prueba de humo posterior al despliegue (`pnpm smoke:release`).

### Conservado
- TypeScript estricto, módulos ECMAScript y NodeNext.
- Mongoose y MongoDB Atlas, contrato de errores uniforme.
- JWT, roles, Helmet, CORS, límite de solicitudes y OpenAPI.

### Seguridad
- Secretos solo en variables de entorno de Vercel.
- Origen CORS exacto y proxy de confianza con un salto.
