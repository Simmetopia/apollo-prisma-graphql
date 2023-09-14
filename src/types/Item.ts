import { arg, extendType, inputObjectType, nonNull, objectType } from 'nexus';
import { Item } from 'nexus-prisma';

export const item = objectType({
  name: Item.$name,
  definition(t) {
    t.field(Item.id);
    t.field(Item.saberPart);
    t.field(Item.partName);
    t.field(Item.partDescription);
    t.field(Item.price);
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
