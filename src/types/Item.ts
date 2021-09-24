
import { objectType, inputObjectType, extendType, stringArg, nonNull, list } from 'nexus';
import { Item } from "nexus-prisma"
import { readFileSync } from 'fs';
import { lorem } from 'faker';

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
  definition: (t) => {
    t.field("items", {
      type: nonNull(list(nonNull('Item'))),
      resolve: (source, args, ctx) =>
      {
        return ctx.db.item.findMany();
      }
    })
  },
});

export const ItemMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('itemCreate', {
      type: 'Item',
      args: {userId: nonNull(stringArg())},
      resolve: async (source, {userId}, ctx) => {

        const saberParts = await ctx.db.saberPart.findMany();
        const saberPart = saberParts[Math.floor(Math.random() * saberParts.length)]
        const partNames = await ctx.db.partName.findMany( {where: {saberPartId: saberPart.id}});
    

        return await ctx.db.item.create({ 
          data: 
          { 
            partName: partNames[Math.floor(Math.random() * partNames.length)].name, 
            partDescription: lorem.paragraph(), 
            saberPart: saberPart.name, 
            userId: userId, 
            price: Math.floor(Math.random() * 299)
          }
        });
      }
    })
  },
});
