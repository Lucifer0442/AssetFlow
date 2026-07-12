import logger from './logger';
import prisma from '../prisma/prismaClient';

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // Run a simple test query to verify the connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('🔌 Database connection verified successfully.');
    return true;
  } catch (error) {
    logger.error('❌ Database connection verification failed:', error);
    return false;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('🔌 Database disconnected successfully.');
  } catch (error) {
    logger.error('❌ Error disconnecting database:', error);
  }
}
