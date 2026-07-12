import { roleMiddleware } from './roleMiddleware';

// In a role-based access control system, permissions map to roles.
export const permissionMiddleware = roleMiddleware;
export default permissionMiddleware;
