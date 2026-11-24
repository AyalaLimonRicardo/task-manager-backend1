// Valores ficticios solo para pruebas: no se conecta a Atlas ni se usan secretos reales.
process.env.NODE_ENV = 'test';
process.env.APP_VERSION = '1.0.0-test';
process.env.PORT = '3000';
process.env.PUBLIC_API_URL = 'http://localhost:3000';
process.env.TRUST_PROXY_HOPS = '0';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/test';
process.env.MONGODB_DB_NAME = 'task_api_test';
process.env.JWT_SECRET = 'secreto-solo-para-pruebas-con-32-bytes-minimo';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.AUTH_RATE_LIMIT_MAX = '1000';
