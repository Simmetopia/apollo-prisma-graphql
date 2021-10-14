import { ApolloError } from 'apollo-server-errors';
import { datatype, lorem, random } from 'faker';
import { extendType, inputObjectType, list, nonNull, objectType, stringArg } from 'nexus';
import { Item, PartName, SaberPart } from 'nexus-prisma';

export const item = objectType({
  name: Item.$name,
  definition(t) {
    t.field(Item.id);
    t.field(Item.SaberPart); //filtering
    t.field(Item.PartName);
    t.field(Item.partDescription);
    t.field(Item.price);
    t.field(Item.userId);
    t.field(Item.User);
    t.field(Item.carts);
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
    t.field('items', {
      type: nonNull(list(nonNull('Item'))),
      resolve: (source, args, ctx) => {
        return ctx.db.item.findMany();
      },
    });
    t.field('displayItems', {
      type: nonNull(list(nonNull('Item'))),
      args: { username: nonNull(stringArg()) },
      resolve: async (source, { username }, ctx) => {
        return await ctx.db.item.findMany({ where: { User: { username } } });
      },
    });
    t.field('filterItems', {
      type: nonNull(list(nonNull('Item'))),
      args: { saberPart: nonNull(stringArg()) },
      resolve: async (source, { saberPart }, ctx) => {
        if (saberPart == '') {
          return await ctx.db.item.findMany({ where: { User: { username: 'dark_saber_dealer_69' } } });
        }
        return await ctx.db.item.findMany({
          where: { SaberPart: { name: saberPart }, User: { username: 'dark_saber_dealer_69' } },
        });
      },
    });
  },
});

export const ItemMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('itemCreate', {
      type: 'Item',
      resolve: async (source, args, ctx) => {
        const saberParts = await ctx.db.saberPart.findMany();
        const saberPart = random.arrayElement(saberParts);

        const partNames = await ctx.db.partName.findMany({ where: { saberPartId: saberPart.id } });
        const watto = await ctx.db.user.findFirst({ where: { username: 'dark_saber_dealer_69' } });

        return await ctx.db.item.create({
          data: {
            saberPartId: saberPart.id,
            partNameId: random.arrayElement(partNames).id,
            partDescription: lorem.paragraph(),
            price: datatype.number(300),
            userId: watto?.id,
          },
        });
      },
    }),
      t.field('itemSell', {
        type: 'Item',
        args: {
          itemId: nonNull(stringArg()),
        },
        resolve: async (source, args, ctx) => {
          const item = await ctx.db.item.findFirst({
            where: {
              id: args.itemId,
              userId: ctx.user?.id.toString(),
            },
          });

          if (item === null) {
            throw new Error("User doesn't own this item");
          }
          try {
            const result = await ctx.db.$transaction(async (db) => {
              const watto = await db.user.update({
                where: { username: 'dark_saber_dealer_69' },
                data: {
                  money: { decrement: item?.price! },
                },
              });
              if (watto.money < 0) {
                throw new Error('Watto is too poor');
              }

              await db.user.update({
                where: { id: ctx.user?.id.toString() },
                data: {
                  money: { increment: item?.price! },
                },
              });

              return await ctx.db.item.update({
                where: { id: args.itemId },
                data: {
                  User: {
                    connect: { id: watto?.id },
                  },
                },
              });
            });

            return result ?? null;
          } catch (err) {
            const error = err as Error;
            throw new ApolloError(error.message);
          } finally {
            // ctx.pubSub.publish('USER_MONEY', { userId: ctx.user?.id.toString() });
          }
        },
      }),
      t.field('itemUpdatePrice', {
        type: nonNull(list(nonNull('Item'))),
        resolve: async (source, args, ctx) => {
          const items = await ctx.db.item.findMany();

          items.map(async (item) => {
            const change = Math.round(datatype.float({ min: 0.85, max: 1.19 }) * item.price!);

            await ctx.db.item.update({
              where: { id: item.id },
              data: { price: change },
            });
          });

          return await ctx.db.item.findMany();
        },
      }),
      t.field('addToCart', {
        type: nonNull('Item'),
        args: {
          itemId: nonNull(stringArg()),
        },
        resolve: async (source, args, ctx) => {
          return await ctx.db.user.update({
            where: { id: ctx.user?.id.toString() },
            data: {
              cart: {
                connect: {
                  id: args.itemId,
                },
              },
            },
          });
        },
      }),
      t.field('removeFromCart', {
        type: nonNull('Item'),
        args: {
          itemId: nonNull(stringArg()),
        },
        resolve: async (source, args, ctx) => {
          return await ctx.db.user.update({
            where: { id: ctx.user?.id.toString() },
            data: {
              cart: {
                disconnect: {
                  id: args.itemId,
                },
              },
            },
          });
        },
      }),
      t.field('buyCart', {
        type: nonNull(list(nonNull('Item'))),
        resolve: async (source, args, ctx) => {
          let watto = await ctx.db.user.findFirst({ where: { username: 'dark_saber_dealer_69' } });
          const buyer = await ctx.db.user.findFirst({
            where: { id: ctx.user?.id.toString() },
            include: { cart: { include: { PartName: true } } },
          });

          const totalPrice = getPriceAndCheckOwner(buyer!, watto!.id);

          try {
            const result = await ctx.db.$transaction(async (db) => {
              const user = await db.user.update({
                where: { id: ctx.user?.id.toString() },
                data: {
                  money: { decrement: totalPrice },
                },
              });

              if (user.money < 0) {
                throw new Error('Not enough money');
              }

              await db.user.update({
                where: { username: 'dark_saber_dealer_69' },
                data: {
                  money: { increment: totalPrice },
                },
              });

              buyer?.cart.forEach(async (item) => {
                await db.item.update({
                  where: { id: item.id },
                  data: {
                    User: {
                      connect: { id: ctx.user?.id.toString() },
                    },
                    carts: {
                      disconnect: { id: ctx.user?.id.toString() },
                    },
                  },
                });
              });

              return db.item.findMany({ where: { id: ctx.user?.id.toString() } });
            });

            return result ?? null;
          } catch (err) {
            const error = err as Error;
            throw new ApolloError(error.message);
          } finally {
            // ctx.pubSub.publish('USER_MONEY', { userId: ctx.user?.id.toString() });
          }
        },
      });
  },
});

function getPriceAndCheckOwner(
  buyer: import('.prisma/client').User & {
    cart: (import('.prisma/client').Item & { PartName: import('.prisma/client').PartName | null })[];
  },
  wattoId: string,
) {
  let price = 0;
  let unownedItems: string[] = [];

  buyer.cart.forEach((item) => {
    price += item.price!;

    if (item.userId != wattoId) {
      unownedItems.push(item.PartName?.name!);
    }
  });

  if (unownedItems.length !== 0) throw new Error("Watto doesn't own these items" + unownedItems);

  return price;
}
