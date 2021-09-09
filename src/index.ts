import { PrismaClient } from '@prisma/client';
import { ApolloServer } from 'apollo-server';
import { makeSchema } from 'nexus';
import { $settings } from 'nexus-prisma';
import * as types from './types';
import path from 'path';

const server = new ApolloServer({
  schema: makeSchema({
    types,
    contextType: {
      module: path.join(__dirname, 'types', 'context.ts'),
      export: 'ContextType',
    },
  }),
  context() {
    return {
      db: new PrismaClient(), // <-- You put Prisma client on the "db" context property
    };
  },
});

$settings({
  prismaClientContextField: 'db', // <-- Tell Nexus Prisma
});
const port = process.env.PORT || 4000;

server.listen({ port }, () => console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`));
