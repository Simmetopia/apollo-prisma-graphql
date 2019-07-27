import { nexusPrismaPlugin } from '@generated/nexus-prisma';
import Photon from '@generated/photon';
import { makeSchema } from '@prisma/nexus';
import { ApolloServer } from 'apollo-server';
import { join } from 'path';

import { Context } from './types';
import { Item } from './types/Item';
import { Mutation } from './types/Mutations';
import { userQueries } from './types/Queries';
import { SaberPart } from './types/SaberPart';
import { Transaction } from './types/Transactions';
import { User } from './types/User';
import { UserDetails } from './types/UserDetails';

const photon = new Photon();

const nexusPrisma = nexusPrismaPlugin({
  photon: (ctx: Context) => ctx.photon,
});

const schema = makeSchema({
  types: [userQueries, Mutation, Transaction, Item, User, SaberPart, UserDetails, nexusPrisma],
  outputs: {
    typegen: join(__dirname, '../generated/nexus-typegen.ts'),
    schema: join(__dirname, '/schema.graphql'),
  },
  typegenAutoConfig: {
    sources: [
      {
        source: '@generated/photon',
        alias: 'photon',
      },
      {
        source: join(__dirname, 'types.ts'),
        alias: 'ctx',
      },
    ],
    contextType: 'ctx.Context',
  },
});

const server = new ApolloServer({
  schema,
  context: ({ req }) => ({
    photon,
    request: req,
  }),
});
server.listen().then(({ port }) => console.log(`🚀 Server ready at http://localhost:${port}`));
