import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { PrismaClient } from '@prisma/client';
import { GraphQLSchema } from 'graphql';
import { makeSchema } from 'nexus';
import { $settings } from 'nexus-prisma';
import path, { join } from 'path';

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
const prisma_client = new PrismaClient();
const server = new ApolloServer({
  schema: shema as unknown as GraphQLSchema,
});

$settings({
  prismaClientContextField: 'db', // <-- Tell Nexus Prisma
});
const port = Number(process.env.PORT) || 4000;

startStandaloneServer(server, {
  listen: { port: port },
  context: async (request) => {
    return {
      ...request,
      db: prisma_client,
    };
  },
}).then((app) => {
  console.log(`🚀  Server ready at: ${app.url}`);
});
