// Valores ficticios solo para pruebas: no se conecta a Atlas ni se usan secretos reales.
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/test';
process.env.MONGODB_DB_NAME = 'task_api_test';
process.env.JWT_SECRET = 'secreto-solo-para-pruebas-con-32-bytes-minimo';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.AUTH_RATE_LIMIT_MAX = '1000';
