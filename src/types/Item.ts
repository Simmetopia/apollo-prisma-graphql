import { datatype, lorem, random } from 'faker';
import { extendType, inputObjectType, list, nonNull, objectType, stringArg } from 'nexus';
import { Item, PartName, SaberPart } from "nexus-prisma";

export const item = objectType({
  name: Item.$name,
  definition(t) {
    t.field(Item.id);
    t.field(Item.SaberPart);
    t.field(Item.PartName);
    t.field(Item.partDescription);
    t.field(Item.price);
    t.field(Item.userId);
    t.field(Item.User)
  },
});

export const saberPart = objectType({
  name: SaberPart.$name,
  definition(t) {
    t.field(SaberPart.id);
    t.field(SaberPart.name);
  },
});

export const partName = objectType({
  name: PartName.$name,
  definition(t) {
    t.field(PartName.id);
    t.field(PartName.name);
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
      args: { username: nonNull(stringArg()) },
      resolve: async (source, { username }, ctx) => {
        return await ctx.db.item.findMany({ where: { User: { username } } });
      },
    });
    // t.field("displayShopItems", {
    //   type: nonNull(list(nonNull('Item'))),
    //   resolve: async (source, args, ctx) => {
    //     return await ctx.db.item.findMany({ where: { username: "dark_saber_dealer_69" } });
    //   },
    // });
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
            saberPartId: saberPart.id,
            partNameId: random.arrayElement(partNames).id,
            partDescription: lorem.paragraph(),
            price: datatype.number(300),
            userId
          }
        });
      }
    })
  },
});
