import { AuthRepository } from './repository';
import { RegisterUserData, LoginResponse } from './types';
import { comparePassword, hashPassword } from '../../utils/password';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt';
import { BadRequestError, ConflictError, UnauthorizedError, NotFoundError } from '../../errors/customErrors';
import crypto from 'crypto';
import EmailService from '../../utils/email';

export class AuthService {
  public static async register(data: RegisterUserData) {
    const existing = await AuthRepository.findUserByEmail(data.email);
    if (existing) {
      throw new ConflictError('User with this email already exists');
    }

    const passwordHash = await hashPassword(data.passwordHash); // data.passwordHash holds plain text initially
    const user = await AuthRepository.registerUser({
      ...data,
      passwordHash,
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.employee?.firstName || '',
      lastName: user.employee?.lastName || '',
      employeeCode: user.employee?.employeeCode || '',
    };
  }

  public static async login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<LoginResponse> {
    const user = await AuthRepository.findUserByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Map DB user roles to standard array of names
    const roles = user.userRoles.map((ur) => ur.role.name);

    const payload = {
      userId: user.id,
      email: user.email,
      roles,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Hash refresh token for db storage
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await AuthRepository.createSession(user.id, tokenHash, expiresAt, ipAddress, userAgent);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.employee?.firstName || '',
        lastName: user.employee?.lastName || '',
        employeeCode: user.employee?.employeeCode || '',
        roles,
      },
      accessToken,
      refreshToken,
    };
  }

  public static async logout(refreshToken: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await AuthRepository.deleteSession(tokenHash);
  }

  public static async requestPasswordReset(email: string): Promise<void> {
    const user = await AuthRepository.findUserByEmail(email);
    if (!user) {
      // Avoid revealing account existence (security standard)
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour validity

    await AuthRepository.createPasswordResetToken(user.id, tokenHash, expiresAt);
    await EmailService.sendPasswordResetEmail(user.email, resetToken);
  }

  public static async resetPassword(token: string, newPasswordPlain: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const resetRecord = await AuthRepository.findPasswordResetToken(tokenHash);

    if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
      throw new BadRequestError('Invalid or expired password reset token');
    }

    const passwordHash = await hashPassword(newPasswordPlain);
    await AuthRepository.updatePassword(resetRecord.userId, passwordHash);
    await AuthRepository.markPasswordResetTokenUsed(resetRecord.id);
  }

  public static async promoteUser(userId: string, roleName: string, adminUserId: string) {
    const user = await AuthRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const userRole = await AuthRepository.promoteUserRole(userId, roleName, adminUserId);
    return userRole;
  }
}
export default AuthService;
