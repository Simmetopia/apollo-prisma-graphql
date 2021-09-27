
import { objectType, inputObjectType, extendType, stringArg, nonNull, list } from 'nexus';
import { Item } from "nexus-prisma"
import { readFileSync } from 'fs';
import { datatype, lorem, random } from 'faker';

export const item = objectType({
  name: Item.$name,
  definition(t) {
    t.field(Item.id);
    t.field('saberPart', {
      type: 'String',
    });
    t.field('partName', {
      type: 'String'
    });
    t.field('userId', {
      type: 'String'
    });
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
  definition(t) {
    t.field("items", {
      type: nonNull(list(nonNull('Item'))),
      resolve: (source, args, ctx) => {
        return ctx.db.item.findMany();
      },
    });
    t.field("displayItems", {
      type: nonNull(list(nonNull('Item'))),
      args: { userId: nonNull(stringArg()) },
      resolve: async (source, { userId }, ctx) => {
        return await ctx.db.item.findMany({ where: { userId } });
      },
    });
  },
});

export const ItemMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('itemCreate', {
      type: 'Item',
      args: { userId: nonNull(stringArg()) },
      resolve: async (source, { userId }, ctx) => {

        const saberParts = await ctx.db.saberPart.findMany();
        const saberPart = random.arrayElement(saberParts);

        const partNames = await ctx.db.partName.findMany({ where: { saberPartId: saberPart.id } });

        return await ctx.db.item.create({
          data: {
            partName: random.arrayElement(partNames).name,
            partDescription: lorem.paragraph(),
            saberPart: saberPart.name,
            price: datatype.number(500),
            userId
          }
        });
      }
    })
  },
});
