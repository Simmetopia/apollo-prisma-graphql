import { PrismaClient } from '.prisma/client';

export interface ContextType {
  db: PrismaClient;
}
