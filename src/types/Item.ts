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
    }),
    t.field('itemBuy', {
      type: 'Item',
      args: { 
        userBuyerId: nonNull(stringArg()), 
        itemId: nonNull(stringArg()) 
      },
      resolve: async (source, args, ctx) => {
        const buyer = await ctx.db.user.findFirst({ where: { id: args.userBuyerId } })
        const watto = await ctx.db.user.findFirst({ where: { username: "dark_saber_dealer_69" }})
        const item = await ctx.db.item.findFirst({ where: { 
          id: args.itemId,
          userId: watto?.id
        }})
        
        if(item === null)
          throw new Error("Watto doesn't own this item")
        
        if (buyer?.money! - item?.price! < 0) {
          throw new Error("Not enough money")
        }
        
        await ctx.db.user.update({ 
          where: { id: args.userBuyerId }, 
          data: { 
            money: { decrement: item?.price!}
          }
        })

        await ctx.db.user.update({ 
          where: { username: "dark_saber_dealer_69" },
          data: { 
            money: { increment: item?.price! }
          }
        })
        
        return await ctx.db.item.update({ 
          where: { id: args.itemId }, 
          data: {
            User: {
              connect: { id: args.userBuyerId }
            }
          } 
        })
      }
    }),
    t.field('itemSell', {
      type: 'Item',
      args: { 
        userSellerId: nonNull(stringArg()), 
        itemId: nonNull(stringArg()) 
      },
      resolve: async (source, args, ctx) => {
        const seller = await ctx.db.user.findFirst({ where: { id: args.userSellerId } })
        const watto = await ctx.db.user.findFirst({ where: { username: "dark_saber_dealer_69" }})
        const item = await ctx.db.item.findFirst({ where: { 
          id: args.itemId,
          userId: seller?.id
        }})
        
        if(item === null)
          throw new Error("User doesn't own this item")
        
        if (watto?.money! - item?.price! < 0) {
          throw new Error("Watto doesn't enough money")
        }
        
        await ctx.db.user.update({ 
          where: { id: args.userSellerId }, 
          data: { 
            money: { increment: item?.price!}
          }
        })

        await ctx.db.user.update({ 
          where: { username: "dark_saber_dealer_69" },
          data: { 
            money: { decrement: item?.price! }
          }
        })
        
        return await ctx.db.item.update({ 
          where: { id: args.itemId }, 
          data: {
            User: {
              connect: { id: watto?.id }
            }
          } 
        })
      }
    })
  },
});
