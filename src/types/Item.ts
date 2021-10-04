import { company, lorem, random } from 'faker';
import { Source } from 'graphql';
import { objectType, inputObjectType, idArg, arg, extendType, nonNull, list, stringArg } from 'nexus';
import { Item, User } from 'nexus-prisma';
import { AuthenticationError } from 'apollo-server-errors';
import { Item as Item2, User as User2 } from '.prisma/client';

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
    t.field(Item.url);
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

export const FilterItemArgs = inputObjectType({
  name: 'FilterItemArgs',
  definition: (t) => {
    t.nonNull.string('filterValue');
  },
});

export const FilterItemPriceArgs = inputObjectType({
  name: 'FilterItemPriceArgs',
  definition: (t) => {
    t.nonNull.int('filterPrice');
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
    t.field('FilteringItems', {
      type: list('Item'),
      args: {
        input: arg({
          type: nonNull(FilterItemArgs),
        }),
      },
      resolve: async (Source, { input: { filterValue } }, context) => {
        return await context.db.item.findMany({ where: { partName: { equals: filterValue } } });
      },
    });
    t.field('FilterItemsByPrice', {
      type: list('Item'),
      args: {
        input: arg({
          type: nonNull(FilterItemPriceArgs),
        }),
      },
      resolve: async (Source, { input: { filterPrice } }, context) => {
        return await context.db.item.findMany({
          where: { AND: [{ NOT: { price: { gte: filterPrice + 1 } } }, { inShop: { equals: true } }] },
        });
      },
    });
    t.field('MostExpensiveItemPrice', {
      type: objectType({
        name: 'Result',
        definition(t) {
          t.nonNull.int('price');
        },
      }),
      resolve: async (Source, args, context) => {
        const price = await context.db.item.aggregate({ _max: { price: true } });
        const maxPrice = price._max.price ?? 0;
        return { price: maxPrice };
      },
    });
  },
});

var saberParts: string[] = ['Emitter', 'Switch', 'Body', 'Pommel', 'Blade'];
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

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  if (min === 0) {
    return Math.round(Math.floor(Math.random() * (125 - 10) + min));
  }
  return Math.round(Math.floor(Math.random() * (max - min) + min));
}

export const ItemMutations = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('ItemCreate', {
      type: 'Item',
      resolve: async (source, args, context) => {
        var saberPartString = saberParts[Math.floor(Math.random() * saberParts.length)];
        var saberNameString = partNames[Math.floor(Math.random() * partNames.length)];
        var partDescriptionsString;
        var price;

        for (let i = 0; i < 5; i++) {
          if (Math.floor(Math.random() * 2) < 1) {
            partDescriptionsString = partDescriptions[i];
            price = getRandomInt(125 * i, 175 * i);
            break;
          }
          if (i === 4) {
            partDescriptionsString = partDescriptions[4];
            price = getRandomInt(125 * i, 175 * i);
          }
        }

        if (saberPartString === 'Blade') {
          return await context.db.item.create({
            data: {
              saberPart: saberPartString,
              price: price,
              partName: saberNameString,
              partDescription: partDescriptionsString,
              inShop: true,
              url: 'http://www.saberparts.com/Media/' + saberPartString + '.png?media=sm',
            },
          });
        } else {
          return await context.db.item.create({
            data: {
              saberPart: saberPartString,
              price: price,
              partName: saberNameString,
              partDescription: partDescriptionsString,
              inShop: true,
              url: 'http://www.saberparts.com/Media/' + saberNameString + '%20' + saberPartString + '.png?media=sm',
            },
          });
        }
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
    t.field('combineItems', {
      type: 'Item',
      args: {
        input: nonNull(
          arg({
            type: combineItemsInputArgs,
          }),
        ),
      },
      resolve: async (source, { input }, context) => {
        if (!input.ItemsId) {
          throw new Error('Error');
        }

        var items: Item2[] = [];

        await Promise.all(
          input.ItemsId.map(async (element) => {
            if (!element) {
              throw new Error('Error: ');
              return;
            }
            var item = await context.db.item.findFirst({
              where: { id: element },
              include: { User: true },
            });

            if (!item) {
              return;
            }

            items.push(item);
          }),
        );

        if (items.length === 0) {
          throw new Error('Please select items to combine');
        } else if (items.length > saberParts.length || items.length < saberParts.length) {
          throw new Error('You can only combine ' + saberParts.length + ' items');
        } else {
          for (let i = 0; i < items.length; i++) {
            if (items[i].partName !== items[0].partName) {
              throw new Error('You need to choise ' + saberParts.length + ' items of same name');
            }
          }
          var emitterCount = 0;
          var switchCount = 0;
          var bodyCount = 0;
          var pommelCount = 0;
          var bladeCount = 0;
          for (let i = 0; i < items.length; i++) {
            if (items[i].saberPart === saberParts[0]) {
              emitterCount++;
              if (emitterCount >= 2) {
                throw new Error('You need to choose one of each part');
              }
            }
            if (items[i].saberPart === saberParts[1]) {
              switchCount++;
              if (switchCount >= 2) {
                throw new Error('You need to choose one of each part');
              }
            }
            if (items[i].saberPart === saberParts[2]) {
              bodyCount++;
              if (bodyCount >= 2) {
                throw new Error('You need to choose one of each part');
              }
            }
            if (items[i].saberPart === saberParts[3]) {
              pommelCount++;
              if (pommelCount >= 2) {
                throw new Error('You need to choose one of each part');
              }
            }
            if (items[i].saberPart === saberParts[4]) {
              bladeCount++;
              if (bladeCount >= 2) {
                throw new Error('You need to choose one of each part');
              }
            }
          }
          for (let i = 0; i < items.length; i++) {
            await context.db.item.delete({
              where: {
                id: items[i].id,
              },
            });
          }

          return await context.db.item.create({
            data: {
              partName: items[0].partName,
              saberPart: 'Light Saber',
              userId: items[0].userId,
              url: 'https://i.ibb.co/WBWsQrT/icons8-lightsaber-480.png',
              inShop: false,
              partDescription: 'Im passivly generating money',
            },
          });
        }
      },
    });
  },
});

export const combineItemsInputArgs = inputObjectType({
  name: 'combineItemsInputArgsItem',
  definition(t) {
    t.field('ItemsId', {
      type: list('ID'),
    });
  },
});
