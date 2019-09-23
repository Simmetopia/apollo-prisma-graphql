import { nexusPrismaPlugin } from '@generated/nexus-prisma';
import { Photon } from '@generated/photon';
import { ApolloServer } from 'apollo-server';
import { makeSchema } from 'nexus';
import { join } from 'path';

import { Context } from './types';
import { ItemGraph } from './types/Item';
import { Mutation } from './types/Mutations';
import { Query } from './types/Queries';
import { SaberPart } from './types/SaberPart';
import { UserGraph } from './types/User';
import { UserDetails } from './types/UserDetails';
import webshop from './webshop';

const photon = new Photon();

const nexusPrisma = nexusPrismaPlugin({
  photon: (ctx: Context) => ctx.photon,
});

const schema = makeSchema({
  types: [
    Mutation,
    Query,
    SaberPart,
    UserDetails,
    nexusPrisma,
    ...webshop,
    ...ItemGraph,
    ...UserGraph,
  ],
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
