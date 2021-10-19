import { PrismaClient } from '.prisma/client';
import { PubSub } from 'apollo-server-express';
import { User } from 'nexus-prisma/*';

export interface ContextType {
  pubSub: PubSub;
  db: PrismaClient;
  user: User | undefined;
}
