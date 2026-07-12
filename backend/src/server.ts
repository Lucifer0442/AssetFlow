import { createServer } from 'http';
import app from './app';
import env from './config/env';
import logger from './config/logger';
import { bootstrap } from './bootstrap';
import { initSocketServer } from './socket/socketServer';
import { disconnectDatabase } from './config/database';

async function startServer() {
  try {
    // 1. Run bootstrap checks (database connectivity, seeding validation)
    await bootstrap();

    // 2. Initialize HTTP Server
    const server = createServer(app);

    // 3. Initialize Socket.io Server
    const io = initSocketServer(server);

    // 4. Start Server Listening
    server.listen(env.PORT, () => {
      logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      logger.info(`📖 API documentation available at: http://localhost:${env.PORT}/api/docs`);
    });

    // 5. Graceful shutdown handler
    const gracefulShutdown = async (signal: string) => {
      logger.info(`📥 Received ${signal}. Starting graceful shutdown...`);

      // Close HTTP connections
      server.close(async () => {
        logger.info('🛑 HTTP server closed.');

        // Close Sockets
        io.close(() => {
          logger.info('🛑 Socket.io server closed.');
        });

        // Disconnect DB client
        await disconnectDatabase();

        logger.info('👋 Graceful shutdown complete. Exiting.');
        process.exit(0);
      });

      // Timeout shutdown fallback after 10 seconds
      setTimeout(() => {
        logger.error('❌ Graceful shutdown timed out. Forcing exit.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      // Let PM2 or process manager restart the node instance on crashes in production
    });

    process.on('uncaughtException', (error) => {
      logger.error('💥 Uncaught Exception thrown:', error);
      process.exit(1);
    });

  } catch (error) {
    logger.error('❌ Failed to start the server:', error);
    process.exit(1);
  }
}

// Start execution
startServer();
