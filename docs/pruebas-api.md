# Pruebas de Task API

| Método | Ruta | Datos enviados | Esperado | Obtenido | Resultado |
|---|---|---|---:|---:|---|
| GET | /health | No aplica | 200 | | |
| GET | /api/tasks | No aplica | 200 | | |
| POST | /api/tasks | title válido | 201 | | |
| GET | /api/tasks/3 | No aplica | 200 | | |
| PATCH | /api/tasks/3/complete | No aplica | 200 | | |
| DELETE | /api/tasks/3 | No aplica | 204 | | |
| GET | /api/tasks/3 | No aplica | 404 | | |
| POST | /api/tasks | title vacío | 400 | | |
| GET | /api/tasks/abc | No aplica | 400 | | |
| GET | /ruta-inexistente | No aplica | 404 | | |
| PATCH | /api/tasks/2 | title nuevo válido (desafío) | 200 | | |
| PATCH | /api/tasks/2 | title vacío (desafío) | 400 | | |
| PATCH | /api/tasks/999 | title válido (desafío) | 404 | | |
