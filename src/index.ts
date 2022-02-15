import { PrismaClient } from '@prisma/client';
import { ApolloServer } from 'apollo-server';
import { makeSchema, connectionPlugin } from 'nexus';
import { $settings } from 'nexus-prisma';
import * as types from './types';
import path from 'path';
import { GraphQLSchema } from 'graphql';

const shema = makeSchema({
  types,
  contextType: {
    module: path.join(__dirname, 'types', 'context.ts'),
    export: 'ContextType',
  },
});

const server = new ApolloServer({
  schema: shema as any as GraphQLSchema,
});

$settings({
  prismaClientContextField: 'db', // <-- Tell Nexus Prisma
});
const port = process.env.PORT || 4000;

server.listen({ port }, () => console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`));
