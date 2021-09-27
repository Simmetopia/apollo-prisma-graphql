
import { objectType, inputObjectType, extendType, stringArg, nonNull, list } from 'nexus';
import { Item } from "nexus-prisma"
import { readFileSync } from 'fs';

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

        const saberParts = ["Addon", "Body", "Emitter", "Pommel", "Switch"]
        const saberPart = saberParts[Math.floor(Math.random() * saberParts.length)];
        const parts = readFileSync(__dirname + "/../assets/SaberParts/" + saberPart + "List.txt").toString();
        const lines = parts.split('\r\n');
        const partName = lines[Math.floor(Math.random() * lines.length)];

        return await ctx.db.item.create({ data: { partName: partName, saberPart: saberPart, userId: userId } });
      }
    })
  },
});
