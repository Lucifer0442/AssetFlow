import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

// Import configurations
import { corsMiddleware } from './config/cors';
import { swaggerSpec } from './config/swagger';
import env from './config/env';

// Import global middlewares
import { requestLogger } from './middlewares/requestLogger';
import { errorMiddleware } from './middlewares/errorMiddleware';
import { notFoundMiddleware } from './middlewares/notFoundMiddleware';

// Import module routers
import { authRouter } from './modules/auth';
import { departmentRouter } from './modules/departments';
import { employeeRouter } from './modules/employees';
import { locationRouter } from './modules/locations';
import { categoryRouter } from './modules/categories';
import { assetRouter } from './modules/assets';
import { allocationRouter } from './modules/allocations';
import { bookingRouter } from './modules/bookings';
import { maintenanceRouter } from './modules/maintenance';
import { auditRouter } from './modules/audits';
import { notificationRouter } from './modules/notifications';
import { activityLogRouter } from './modules/activity-logs';

export const app = express();

// Security and utility parsing middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // allow serving assets/uploads to different origins
}));
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logger middleware
app.use(requestLogger);

// Serve uploads folder as a static path
app.use('/uploads', express.static(path.join(__dirname, '..', env.UPLOAD_DIR)));

// Swagger API documentation path
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Register versioned module endpoints
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/departments`, departmentRouter);
app.use(`${API_PREFIX}/employees`, employeeRouter);
app.use(`${API_PREFIX}/locations`, locationRouter);
app.use(`${API_PREFIX}/categories`, categoryRouter);
app.use(`${API_PREFIX}/assets`, assetRouter);
app.use(`${API_PREFIX}/allocations`, allocationRouter);
app.use(`${API_PREFIX}/bookings`, bookingRouter);
app.use(`${API_PREFIX}/maintenance`, maintenanceRouter);
app.use(`${API_PREFIX}/audits`, auditRouter);
app.use(`${API_PREFIX}/notifications`, notificationRouter);
app.use(`${API_PREFIX}/activity-logs`, activityLogRouter);

// Express Error Handlers (404 and global exceptions)
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
