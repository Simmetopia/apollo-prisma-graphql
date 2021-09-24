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
    t.field('AddItemToUserTestMutation', {
      type: 'Item',
      args: {
        input: arg({
          type: nonNull(
            inputObjectType({
              name: 'AddItemInputArgs',
              definition(t) {
                t.nonNull.id('id');
              },
            }),
          ),
        }),
      },
      resolve: async (Source, { input: { id } }, context) => {
        const itemFound = await context.db.item.update({
          where: { id: id },
          //Added to user with userName hej
          data: { userId: 'cktv70jyw00004sknxob85w6v' },
        });
        return itemFound;
      },
    });
  },
});
