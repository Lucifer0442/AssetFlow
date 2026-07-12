import cors from 'cors';
import env from './env';

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // If CORS_ORIGIN is '*', allow all origins
    if (env.CORS_ORIGIN === '*') {
      callback(null, true);
      return;
    }

    const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};

export const corsMiddleware = cors(corsOptions);
export default corsMiddleware;
