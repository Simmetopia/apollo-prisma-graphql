import { arg, extendType, inputObjectType, nonNull, objectType, subscriptionType } from 'nexus';
import { Item } from 'nexus-prisma';

import { pubsub } from '..';

export const item = objectType({
  name: Item.$name,
  definition(t) {
    t.field(Item.id);
    t.field(Item.saberPart);
    t.field(Item.partName);
    t.field(Item.partDescription);
    t.field(Item.price);
    t.field(Item.userId);
  },
});

export const ItemArgs = inputObjectType({
  name: 'ItemArgs',
  definition: (t) => {
    t.string('partDescription');
    t.nonNull.string('partName');
    t.nonNull.string('saberPart');
    t.int('price');
  },
});

export const ItemQueries = extendType({
  type: 'Query',
  definition: (t) => {
    t.nonNull.list.field('getUserItems', {
      type: nonNull('Item'),
      resolve: async (source, args, context) => {
        return context.db.item.findMany({ where: { userId: { equals: context.user.id } } });
      },
    });
    t.nonNull.list.field('getMarketItems', {
      type: nonNull('Item'),
      resolve: async (source, args, context) => {
        return context.db.item.findMany({ where: { userId: { equals: 'clmixf8o50000kees7k4x9h6m' } } });
      },
    });
  },
});

export const ItemMutations = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('createItem', {
      type: 'Item',
      args: {
        input: nonNull(arg({ type: 'ItemArgs' })),
      },
      resolve: async (source, args, context) => {
        return context.db.item.create({
          data: {
            partDescription: args.input.partDescription,
            partName: args.input.partName,
            saberPart: args.input.saberPart,
            price: args.input.price,
          },
        });
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
      async subscribe(_, __, context) {
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

    t.nonNull.list.nonNull.field('UsersItems', {
      type: 'Item',
      async subscribe(_, __, context) {
        const user = await context.db.user.findUniqueOrThrow({
          where: { id: 'clmg73he80000klpfc6wki10b' },
          include: { inventory: true },
        });
        update_later('UsersItems', user.inventory);

        return pubsub.asyncIterator(['UsersItems']);
      },
      resolve(eventData) {
        return eventData;
      },
    });
  },
});
