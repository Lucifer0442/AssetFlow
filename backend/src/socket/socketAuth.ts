import { Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import logger from '../config/logger';

export function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void): void {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      logger.warn(`🔌 Socket connection rejected: Token missing. ID: ${socket.id}`);
      return next(new Error('Authentication error: Token missing'));
    }

    const decoded = verifyAccessToken(token);
    socket.data.user = decoded;
    logger.info(`🔌 Socket authenticated: User ${decoded.email} connected with ID ${socket.id}`);
    next();
  } catch (error) {
    logger.warn(`🔌 Socket connection rejected: Authentication failed. ID: ${socket.id}`);
    next(new Error('Authentication error: Invalid token'));
  }
}
