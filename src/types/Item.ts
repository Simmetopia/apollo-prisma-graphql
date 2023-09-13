import { PrismaClient } from '@prisma/client';
import { arg, extendType, inputObjectType, nonNull, objectType, stringArg } from 'nexus';
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
      args: {
        userId: nonNull(stringArg()),
      },
      resolve: async (source, args, context) => {
        return context.db.item.findMany({ where: { userId: { equals: args.userId } } });
      },
    });
    t.nonNull.list.field('getMarketItems', {
      type: nonNull('Item'),
      resolve: async (source, args, context) => {
        return context.db.item.findMany({ where: { userId: { equals: 'clmhg4l5l0000ke3pp76cx98i' } } });
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
    t.field('updateItemUserIdById', {
      type: 'Item',
      args: {
        partname: nonNull(stringArg()),
        newUserId: nonNull(stringArg()),
      },
      resolve: async (source, args, context) => {
        const item = await context.db.item.findFirstOrThrow({ where: { partName: { equals: args.partname } } });

        // Update the user ID of the found item
        const updatedItem = await context.db.item.update({
          where: { id: item.id }, // Assuming 'id' is the unique identifier of the item
          data: { userId: args.newUserId },
        });

        return updatedItem;
      },
    });
  },
});

async function purchaseItem(seller: string, buyer: string, itemId: string, db: PrismaClient) {
  return await db.$transaction(async (tx) => {
    const item = await tx.item.findFirstOrThrow({ where: { id: { equals: itemId } } });
    // Decrement money from the buyer and add item to userid
    const to = await tx.user.update({
      data: {
        money: {
          decrement: item.price,
        },
        inventory: { connect: { id: item.id } },
      },
      where: {
        id: buyer,
      },
    });

    // Validate buyer has enough money
    if (to.money < 0) {
      throw new Error('User with id ${from} doesnt have enough money ($money)');
    }

    // Increment balance of seller
    const from = await tx.user.update({
      data: {
        money: {
          increment: item.price,
        },
      },
      where: {
        id: seller,
      },
    });

    // Return buyer
    return to;
  });
}
