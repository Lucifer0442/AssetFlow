import { prisma } from '../../prisma/prisma';
import { User, Role, UserRole, UserSession, PasswordResetToken } from '@prisma/client';
import { RegisterUserData } from './types';

export class AuthRepository {
  public static async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        employee: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  public static async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        employee: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  public static async registerUser(data: RegisterUserData) {
    // We execute registration inside a transaction to create User, Employee,
    // and assign the default 'employee' role.
    return prisma.$transaction(async (tx) => {
      // Find the employee role ID
      let role = await tx.role.findUnique({
        where: { name: 'employee' },
      });

      if (!role) {
        role = await tx.role.create({
          data: {
            name: 'employee',
            description: 'Default role for employees',
          },
        });
      }

      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          isActive: true,
          emailVerified: false,
          employee: {
            create: {
              employeeCode: data.employeeCode,
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              status: 'active',
            },
          },
          userRoles: {
            create: {
              roleId: role.id,
            },
          },
        },
        include: {
          employee: true,
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      return user;
    });
  }

  public static async createSession(userId: string, tokenHash: string, expiresAt: Date, ipAddress?: string, userAgent?: string): Promise<UserSession> {
    return prisma.userSession.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });
  }

  public static async deleteSession(tokenHash: string): Promise<void> {
    await prisma.userSession.deleteMany({
      where: { tokenHash },
    });
  }

  public static async createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date): Promise<PasswordResetToken> {
    // Invalidate any older tokens for this user first
    await prisma.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() }, // mark as used/expired
    });

    return prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  public static async findPasswordResetToken(tokenHash: string) {
    return prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: {
        user: true,
      },
    });
  }

  public static async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  public static async markPasswordResetTokenUsed(tokenId: string): Promise<void> {
    await prisma.passwordResetToken.update({
      where: { id: tokenId },
      data: { usedAt: new Date() },
    });
  }

  public static async promoteUserRole(userId: string, roleName: string, assignedByUserId: string): Promise<UserRole> {
    return prisma.$transaction(async (tx) => {
      // Find the role
      let role = await tx.role.findUnique({
        where: { name: roleName },
      });

      if (!role) {
        role = await tx.role.create({
          data: {
            name: roleName,
          },
        });
      }

      // Check if user already has this role
      const existing = await tx.userRole.findFirst({
        where: { userId, roleId: role.id },
      });

      if (existing) {
        return existing;
      }

      return tx.userRole.create({
        data: {
          userId,
          roleId: role.id,
          assignedBy: assignedByUserId,
        },
      });
    });
  }
}
export default AuthRepository;
