import { PrismaClient } from '../../generated/prisma/index';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Create or reuse instance
export const db =
  globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
