import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { socketOptions } from '../config/socket';
import { socketAuthMiddleware } from './socketAuth';
import { registerSocketEvents, socketBroadcaster } from './socketEvents';
import logger from '../config/logger';

let io: Server | null = null;

export function initSocketServer(server: HttpServer): Server {
  if (io) {
    logger.warn('🔌 Socket.io server already initialized');
    return io;
  }

  logger.info('🔌 Initializing Socket.io server...');
  io = new Server(server, socketOptions);

  // Apply authentication middleware
  io.use(socketAuthMiddleware);

  // Set reference for broadcasting helpers
  socketBroadcaster.setIO(io);

  // Register all system socket events
  registerSocketEvents(io);

  return io;
}

export function getSocketIO(): Server {
  if (!io) {
    throw new Error('Socket.io server has not been initialized');
  }
  return io;
}
