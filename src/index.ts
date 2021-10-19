import { PrismaClient } from '@prisma/client';
import { ApolloServer, AuthenticationError, PubSub } from 'apollo-server';
import { applyMiddleware } from 'graphql-middleware';
import { verify } from 'jsonwebtoken';
import { makeSchema } from 'nexus';
import { $settings } from 'nexus-prisma';
import path, { join } from 'path';
import { permissions } from './shield';
import * as types from './types';

const schema = makeSchema({
  types,
  contextType: {
    module: path.join(__dirname, 'types', 'context.ts'),
    export: 'ContextType',
  },
  outputs: {
    typegen: join(__dirname, 'nexus-typegen.ts'), // 2
    schema: join(__dirname, 'schema.graphql'), // 3
  },
});

const schemaWithMiddleware = applyMiddleware(schema, permissions);
const pubSub = new PubSub();
const db = new PrismaClient();

interface ConnectionParams {
  authorization?: string;
}

const server = new ApolloServer({
  schema: schemaWithMiddleware,
  subscriptions: {
    path: '/subscriptions',
    onConnect: async (connectionParams: ConnectionParams, webSocket, context) => {
      console.log('Client connected');
      try {
        if (connectionParams.authorization) {
          const header = connectionParams.authorization?.split(' ');
          const [bearer, token] = header || [];
          const user: { userId: string } = (await verify(token || '', process.env.SECRET!)) as any;
          return { userId: user.userId };
        }
      } catch {
        throw new AuthenticationError('UNAUTHENTICATED');
      }
    },
    onDisconnect: (webSocket, context) => {
      console.log('Client disconnected');
    },
  },

  async context(httpContext) {
    if (httpContext.connection) {
      // check connection for metadata
      return {
        db,
        user: await db.user.findUnique({
          where: { id: httpContext.connection.context.userId },
        }),
        pubSub,
      };
    }

    try {
      const header = httpContext.req.header('authorization')?.split(' ');
      const [bearer, token] = header || [];
      const user: { userId: string } = (await verify(token || '', process.env.SECRET!)) as any;
      const context = {
        db,
        // <-- You put Prisma client on the "db" context property
        user: await db.user.findUnique({
          where: { id: user?.userId },
          include: { cart: true, details: true, inventory: true },
        }),
        pubSub,
      };
      return context;
    } catch {
      return {
        db,
        pubSub,
      };
    }
  },
});

$settings({
  prismaClientContextField: 'db', // <-- Tell Nexus Prisma
});

const port = process.env.PORT || 4000;
server.listen({ port }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
  // console.log(`🚀 Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`);
});
