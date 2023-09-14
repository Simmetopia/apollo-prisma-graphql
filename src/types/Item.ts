import { PrismaClient } from '@prisma/client';
import { extendType, inputObjectType, nonNull, objectType, stringArg, subscriptionType } from 'nexus';
import { Item } from 'nexus-prisma';

import { pubsub } from '..';

export const item = objectType({
  name: Item.$name,
  definition(t) {
    t.field(Item.id);
    t.field(Item.partDescription);
    t.field(Item.partName);
    t.field(Item.saberPart);
    t.field(Item.price);
    t.field(Item.User);
  },
});

export const ItemArgs = inputObjectType({
  name: 'ItemArgs',
  definition: (t) => {
    t.string('partDescription');
    t.string('partName');
    t.string('saberPart');
  },
});

async function trade_item(
  from: { id: string; username?: string; password?: string; money?: number },
  to: { username?: string; id: string; money: number },
  item: {
    id: string;
    saberPart?: string;
    partName?: string;
    partDescription?: string | null;
    price?: number | null;
    userId?: string | null;
  },
  db: PrismaClient,
) {
  return db.$transaction(async (prisma) => {
    if (!item.userId || item.userId !== from.id) throw new Error('not your item');
    if (!item.price || item.price > to.money) throw new Error('no money no honey');

    await prisma.user.update({
      where: { id: from.id },
      data: { money: { increment: item.price }, inventory: { disconnect: { id: item.id } } },
    });
    await prisma.user.update({
      where: { id: to.id },
      data: { money: { decrement: item.price }, inventory: { connect: { id: item.id } } },
    });
    return 'ok';
  });
}

export const update_marketplace = async (db: PrismaClient) => {
  pubsub.publish(
    'marketplace',
    await db.item.findMany({ where: { User: { username: { equals: 'dark_saber_dealer_69' } } } }),
  );
};

export const itemMutations = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('trade_item', {
      type: nonNull('User'),
      args: { item_id: nonNull(stringArg()) },
      resolve: async (_source, { item_id }, { user, db }) => {
        const user_from = await db.user.findUniqueOrThrow({ where: { username: 'dark_saber_dealer_69' } });
        const item = await db.item.findUniqueOrThrow({ where: { id: item_id } });
        await trade_item(user_from, user, item, db);

        await update_marketplace(db);
        return db.user.findUniqueOrThrow({ where: { id: user.id } });
      },
    });
    t.field('sell_item', {
      type: nonNull('User'),
      args: { item_id: nonNull(stringArg()) },
      resolve: async (_source, { item_id }, { user, db }) => {
        const user_from = await db.user.findUniqueOrThrow({ where: { username: 'dark_saber_dealer_69' } });
        const item = await db.item.findUniqueOrThrow({ where: { id: item_id } });
        await trade_item(user, user_from, item, db);

        await update_marketplace(db);
        return db.user.findUniqueOrThrow({ where: { id: user.id } });
      },
    });
  },
});

export const ItemQueries = extendType({
  type: 'Query',
  definition: (t) => {
    t.nonNull.list.nonNull.field('items', {
      type: 'Item',
      resolve: async (_source, _args, context) => {
        return context.db.item.findMany();
      },
    });
    t.nonNull.list.nonNull.field('my_items', {
      type: 'Item',
      resolve: async (_source, _args, context) => {
        return context.db.item.findMany({ where: { userId: context.user.id } });
      },
    });
    t.nonNull.list.nonNull.field('marketplace', {
      type: 'Item',
      resolve: async (_source, _args, context) => {
        return context.db.item.findMany({ where: { User: { username: { equals: 'dark_saber_dealer_69' } } } });
      },
    });
  },
});

export const update_later = (id: string, data: any) => {
  setTimeout(() => {
    pubsub.publish(id, data);
  }, 1000);
};

export const subbies = subscriptionType({
  definition(t) {
    t.nonNull.list.nonNull.field('marketplace', {
      type: 'Item',
      async subscribe(root, args, context) {
        const user = await context.db.user.findUniqueOrThrow({
          where: { username: 'dark_saber_dealer_69' },
          include: { inventory: true },
        });
        update_later('marketplace', user.inventory);

        return pubsub.asyncIterator(['marketplace']);
      },
      resolve(eventData) {
        return eventData;
      },
    });
  },
});
