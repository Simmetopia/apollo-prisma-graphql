import { PrismaClient } from '.prisma/client';

export interface ContextType {
  db: PrismaClient;
  user: { username: string; id: string; money: number };
}
