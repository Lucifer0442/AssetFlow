import { checkDatabaseConnection } from './config/database';
import prisma from './prisma/prismaClient';
import logger from './config/logger';

export async function bootstrap(): Promise<void> {
  logger.info('🚀 Bootstrapping AssetFlow Backend...');

  // 1. Check Database connection
  const dbConnected = await checkDatabaseConnection();
  if (!dbConnected) {
    logger.error('❌ Bootstrapping failed: Database connection could not be established.');
    process.exit(1);
  }

  // 2. Seed Verification
  try {
    const rolesCount = await prisma.role.count();
    if (rolesCount === 0) {
      logger.warn('⚠️ No roles found in the database. Please run: npm run db:seed');
    } else {
      logger.info(`📋 Verified: ${rolesCount} roles available in the database.`);
    }
  } catch (error) {
    logger.error('❌ Bootstrapping failed during role check:', error);
    process.exit(1);
  }
}
