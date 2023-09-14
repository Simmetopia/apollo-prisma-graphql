import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { PrismaClient } from '@prisma/client';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { GraphQLSchema } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
import { useServer } from 'graphql-ws/lib/use/ws';
import http from 'http';
import { makeSchema } from 'nexus';
import { $settings } from 'nexus-prisma';
import path, { join } from 'path';
import { WebSocketServer } from 'ws';

import { auth } from './middleware';
import * as types from './types';

const shema = makeSchema({
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
export const pubsub = new PubSub();

const prisma_client = new PrismaClient();
const app = express();
const httpServer = http.createServer(app);
// Creating the WebSocket server

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/',
});

const serverCleanup = useServer(
  {
    schema: shema,
    context: async () => {
      return { db: prisma_client };
    },
  },
  wsServer,
);
const server = new ApolloServer({
  schema: shema as unknown as GraphQLSchema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

$settings({
  prismaClientContextField: 'db', // <-- Tell Nexus Prisma
});
const port = Number(process.env.PORT) || 4000;

server.start().then(() => {
  app.use(
    '/',
    cors<cors.CorsRequest>(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async (req) => {
        return {
          db: prisma_client,
          user: await auth(req.req, prisma_client),
        };
      },
    }),
  );

  // Modified server startup
  httpServer.listen({ port }, () => {
    console.log('somethign serverlike happened');
  });
});
