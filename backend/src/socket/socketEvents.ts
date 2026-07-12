import { Server, Socket } from 'socket.io';
import logger from '../config/logger';
import { socketEvents } from '../config/socket';

export function registerSocketEvents(io: Server): void {
  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    if (!user) return;

    logger.info(`🔌 Socket client connected: User ID ${user.userId} on socket ${socket.id}`);

    // Join room based on user ID for direct notification routing
    socket.join(`user:${user.userId}`);
    
    // Join room based on user roles (e.g., 'admin', 'technician')
    user.roles.forEach((role: string) => {
      socket.join(`role:${role}`);
      logger.debug(`🔌 Socket ${socket.id} joined role room: role:${role}`);
    });

    socket.on('disconnect', () => {
      logger.info(`🔌 Socket client disconnected: ${socket.id}`);
    });

    socket.on(socketEvents.error, (err) => {
      logger.error(`🔌 Socket error on ${socket.id}:`, err);
    });
  });
}

// ---------------------------------------------------------------------------
// Broadcasting helper functions
// ---------------------------------------------------------------------------

export const socketBroadcaster = {
  io: null as Server | null,

  setIO(ioInstance: Server) {
    this.io = ioInstance;
  },

  // Notify a specific user
  notifyUser(userId: string, data: any) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(socketEvents.NOTIFICATION.NEW, data);
      logger.debug(`📢 Socket broadcast (user:${userId}): Notification sent`);
    }
  },

  // Notify multiple users
  notifyUsers(userIds: string[], data: any) {
    if (this.io) {
      userIds.forEach((id) => {
        this.io?.to(`user:${id}`).emit(socketEvents.NOTIFICATION.NEW, data);
      });
      logger.debug(`📢 Socket broadcast to multiple users: Notification sent`);
    }
  },

  // Broadcast to all users in a role
  notifyRole(role: string, event: string, data: any) {
    if (this.io) {
      this.io.to(`role:${role}`).emit(event, data);
      logger.debug(`📢 Socket broadcast (role:${role}): Event ${event} sent`);
    }
  },

  // Broadcast booking details
  broadcastBookingUpdate(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
      logger.debug(`📢 Socket broadcast: Booking update ${event}`);
    }
  },

  // Broadcast dashboard KPI changes
  broadcastDashboardUpdate(data: any) {
    if (this.io) {
      this.io.emit(socketEvents.DASHBOARD.KPI_UPDATE, data);
      logger.debug('📢 Socket broadcast: Dashboard KPI update');
    }
  },
};
