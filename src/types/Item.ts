import { extendType, inputObjectType, nonNull, objectType, stringArg } from 'nexus';
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
    t.string('partName');
    t.string('saberPart');
  },
});

export const ItemQueries = extendType({
  type: 'Query',
  definition: (t) => {
    t.nonNull.list.field('getAllUserItemsById', {
      type: nonNull('Item'),
      args: {
        userId: nonNull(stringArg()),
      },
      resolve: async (source, args, context) => {
        return context.db.item.findMany({ where: { userId: { equals: args.userId } } });
      },
    });
  },
});

export const ItemMutations = extendType({
  type: 'Mutation',
  definition: (t) => {},
});
