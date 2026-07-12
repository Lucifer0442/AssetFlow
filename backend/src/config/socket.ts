import { ServerOptions } from 'socket.io';
import { corsOptions } from './cors';

export const socketOptions: Partial<ServerOptions> = {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
};

export const socketEvents = {
  connection: 'connection',
  disconnect: 'disconnect',
  error: 'error',
  
  // Custom Modules Namespaces / Channels
  NOTIFICATION: {
    NEW: 'notification:new',
    READ: 'notification:read',
    READ_ALL: 'notification:read_all',
  },
  BOOKING: {
    CREATED: 'booking:created',
    CANCELLED: 'booking:cancelled',
    OVERLAP_ALERT: 'booking:overlap_alert',
  },
  MAINTENANCE: {
    STATUS_UPDATED: 'maintenance:status_updated',
    ASSIGNED: 'maintenance:assigned',
  },
  AUDIT: {
    CYCLE_STARTED: 'audit:cycle_started',
    DISCREPANCY_FOUND: 'audit:discrepancy_found',
  },
  DASHBOARD: {
    KPI_UPDATE: 'dashboard:kpi_update',
  },
};
