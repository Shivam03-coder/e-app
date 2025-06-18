import { PrismaClient } from '../../generated/prisma/index';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error'],
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Create or reuse instance
export const db = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
