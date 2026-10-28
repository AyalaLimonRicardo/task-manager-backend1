import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { app } from './app.js';

try {
  await connectDatabase();
  console.log('Conexión con MongoDB establecida.');
} catch {
  // No se imprime el error original: puede contener la URI o el host del clúster.
  console.error('No fue posible conectar con MongoDB. Revisa .env, el usuario y el acceso de red en Atlas.');
  process.exit(1);
}

app.listen(env.port, () => {
  console.log(`API disponible en http://localhost:${env.port}`);
});
