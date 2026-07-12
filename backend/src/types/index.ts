import { TokenPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export interface UserSessionPayload {
  userId: string;
  email: string;
  roles: string[];
}
