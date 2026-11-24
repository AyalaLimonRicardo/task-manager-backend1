# Reflexión EC3 A11 (borrador)

> Reescribe con tus propias palabras.

1. **¿Por qué usar servicios simulados en las pruebas?** Para probar HTTP, validación, autenticación y roles sin depender de MongoDB Atlas ni de la red; son rápidas y repetibles.
2. **¿Qué prueba SuperTest?** La aplicación Express completa (middlewares, rutas, errores) sin abrir un puerto.
3. **¿Por qué firmar JWT reales en las pruebas?** Así se ejercita `authenticate` y `requireRole` tal como funcionan en producción.
4. **¿Qué aporta OpenAPI?** Un contrato legible por personas y máquinas; los códigos documentados deben coincidir con el código real.
5. **¿Por qué se relaja la CSP solo en /api-docs?** Swagger UI usa scripts y estilos en línea; el resto de la API conserva Helmet completo.
6. **¿Por qué /auth/me consulta la base de datos?** Para confirmar que la cuenta sigue existiendo; si no, responde 401 AUTHENTICATED_USER_NOT_FOUND.
7. **¿Por qué el limitador solo en register y login?** Son los endpoints expuestos a adivinación de credenciales; /me ya exige un token.
8. **¿Para qué el workspace `client/`?** Comprobar la integración mínima de React con la API y verificarla con el mismo `pnpm verify`.
9. **¿Qué no cubren las pruebas simuladas?** La capa de repositorio y MongoDB; requieren pruebas de integración con una base real.
10. **¿Qué dificultad encontraste y cómo la resolviste?** (Escribe tu experiencia real.)
