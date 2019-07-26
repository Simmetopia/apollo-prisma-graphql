import { nexusPrismaPlugin } from '@generated/nexus-prisma';
import Photon, { SaberParts } from '@generated/photon';
import { makeSchema, objectType, stringArg, enumType } from '@prisma/nexus';
import { join } from 'path';
import { Context } from './types';
import { ApolloServer } from 'apollo-server';
import { applyMiddleware } from 'graphql-middleware';
import { permissions } from './permissions';

const photon = new Photon();

const nexusPrisma = nexusPrismaPlugin({
  photon: (ctx: Context) => ctx.photon,
});

export const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.purchases({ type: 'Transaction' });
    t.model.sells({ type: 'Transaction' });
    t.model.username();
  },
});
export const SaberPart = enumType({
  name: 'SaberPart',
  members: [
    SaberParts.CRYSTAL,
    SaberParts.CRYSTAL_VIBRATOR,
    SaberParts.HILT,
    SaberParts.POWER_CORE,
  ],
});
export const Item = objectType({
  name: 'Item',
  definition(t) {
    t.model.id();
    // @ts-ignore
    t.model.saberPart({ type: 'SaberPart' });
    t.model.partDescription();
    t.model.partName();
  },
});

export const Transaction = objectType({
  name: 'Transaction',
  definition(t) {
    t.model.id();
    t.model.price();
    t.model.item({ type: 'Item' });
  },
});

const Query = objectType({
  name: 'Query',
  definition(t) {
    t.field('GetUsers', {
      list: true,
      type: 'User',
      resolve: (_, __, ctx) => {
        return ctx.photon.users.findMany();
      },
    });
  },
});

const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    t.field('CreateUser', {
      type: 'User',
      args: { userName: stringArg({ required: true }) },
      resolve: (_, args, ctx) => {
        return ctx.photon.users.create({ data: { username: args.userName } });
      },
    });
  },
});

const schema = makeSchema({
  types: [Query, Mutation, Transaction, Item, User, SaberPart, nexusPrisma],
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
server
  .listen()
  .then(({ port }) =>
    console.log(`🚀 Server ready at http://localhost:${port}`),
  );
