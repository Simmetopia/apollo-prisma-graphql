import { company, lorem, random } from 'faker';
import { Source } from 'graphql';
import { objectType, inputObjectType, idArg, arg, extendType, nonNull, list, stringArg } from 'nexus';
import { Item } from 'nexus-prisma';

export const item = objectType({
  name: Item.$name,
  definition(t) {
    t.field(Item.id);
    t.field('saberPart', {
      type: 'String',
    });
    t.field('partName', {
      type: 'String',
    });
    t.field('partDescription', {
      type: 'String',
    });
    t.field('price', {
      type: 'Int',
    });
    t.field(Item.userId);
    t.field(Item.User);
    t.field(Item.inShop);
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
    t.field('GetAllItems', {
      type: list('Item'),
      resolve: async (source, args, context) => {
        return await context.db.item.findMany();
      },
    });
    t.field('GetAllItemsInShop', {
      type: list('Item'),
      resolve: async (Source, args, context) => {
        return await context.db.item.findMany({ where: { inShop: true } });
      },
    });
  },
});

var saberParts: string[] = ['Emitter', 'Switch', 'Bodies', 'Pommels', 'Blade'];
var partNames: string[] = ['Commando', 'Outcast', 'Pathfinder'];
var partDescriptions: string[] = [
  'This is a common item',
  'This is a uncommon',
  'This is a rare item',
  'GZ! You found an epic item',
  'LEGENDARY! Hurry up and get it',
];

export const setSellPriceInputArgs = inputObjectType({
  name: 'setSellPriceInputArgs',
  definition(t) {
    t.field('Item', {
      type: nonNull(
        inputObjectType({
          name: 'setSellPriceInputArgsItem',
          definition(t) {
            t.nonNull.id('id');
            t.nonNull.int('price');
            t.nonNull.boolean('inShop');
          },
        }),
      ),
    });
  },
});

export const ItemMutations = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('ItemCreate', {
      type: 'Item',
      resolve: async (source, args, context) => {
        return await context.db.item.create({
          data: {
            saberPart: saberParts[Math.floor(Math.random() * saberParts.length)],
            price: Math.round(Math.random() * (1000 - 1) + 1),
            partName: partNames[Math.floor(Math.random() * partNames.length)],
            partDescription: partDescriptions[Math.floor(Math.random() * partDescriptions.length)],
            inShop: true,
          },
        });
      },
    });
    t.field('DeleteItemsNotOwned', {
      type: objectType({
        name: 'DeleteItemsNotOwnedResault',
        definition(t) {
          t.nonNull.int('ItemsDeleted');
        },
      }),
      resolve: async (source, args, context) => {
        const itemsdeleted = await context.db.item.deleteMany({
          where: { User: null },
        });
        return { ItemsDeleted: itemsdeleted.count };
      },
    });
    t.field('setSellPrice', {
      type: 'Item',
      args: {
        input: nonNull(
          arg({
            type: setSellPriceInputArgs,
          }),
        ),
      },
      resolve: async (
        source,
        {
          input: {
            Item: { id, price, inShop },
          },
        },
        context,
      ) => {
        return context.db.item.update({
          where: { id: id },
          data: {
            price: price,
            inShop: inShop,
          },
        });
      },
    });
  },
});
