import { random } from 'faker';
import { schema } from 'nexus';

import { WEBSHOP_OWNER } from '../webshop';

const { arg } = schema;
export const User = schema.objectType({
  name: 'User',
  definition(t) {
    t.model.id();
    t.model.details();
    t.model.username();
    t.model.inventory();
    t.model.money();
  },
});

const UserUpdateInputArgs = schema.inputObjectType({
  name: 'UserDetailsUpdateArgs',
  definition: (t) => {
    t.string('firstName');
    t.string('lastName');
    t.id('id', { required: true });
  },
});

const UserAuthType = schema.inputObjectType({
  name: 'UserAuthInput',
  nonNullDefaults: { input: true },
  definition: (t) => {
    t.string('username', { required: true });
  },
});

const UserQueries = schema.extendType({
  type: 'Query',
  definition: (t) => {
    t.crud.users();
    t.crud.user();
  },
});

const UserMutations = schema.extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('login', {
      type: 'User',
      args: { data: arg({ required: true, type: UserAuthType }) },
      resolve: (_, { data }, ctx) => {
        return ctx.db.user.findOne({ where: { username: data.username } });
      },
    });

    t.field('signup', {
      type: 'User',
      args: { data: arg({ type: UserAuthType, required: true }) },
      resolve: async (_, { data }, ctx) => {
        try {
          const a = await ctx.db.user.create({
            data: { username: data.username, money: random.number(30), details: { create: {} } },
          });
          return a;
        } catch (e) {
          console.log(e);
          throw new Error('User with that name already exists');
        }
      },
    });

    t.field('userUpdate', {
      type: 'User',
      args: {
        data: arg({ type: UserUpdateInputArgs, required: true }),
      },
      resolve: (_, args, ctx) => {
        return ctx.db.user.update({
          where: { id: args.data.id },
          data: {
            details: {
              update: {
                firstName: args.data.firstName,
                lastName: args.data.lastName,
              },
            },
          },
        });
      },
    });
  },
});

const BuyItemArgs = schema.inputObjectType({
  name: 'BuyItemArgs',
  nonNullDefaults: { input: true },
  definition: (t) => {
    t.id('userId', { required: true });
    t.id('itemId', { required: true });
  },
});

const BuyAndSellItems = schema.extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('requestPurchase', {
      type: 'User',
      args: { data: arg({ type: BuyItemArgs, description: 'Input args to request a  purchase', required: true }) },
      resolve: async (_parent, { data: { userId, itemId } }, ctx) => {
        const webshopOwnerHasItem = await ctx.db.user.findOne({
          select: { inventory: true, money: true },
          where: { username: WEBSHOP_OWNER },
        });
        if (!webshopOwnerHasItem) {
          return null;
        }
        const item = webshopOwnerHasItem?.inventory.find((item) => item.id === itemId);
        if (!item?.price) {
          throw new Error('Webshop does not own requested item');
        }

        const user = await ctx.db.user.findOne({ where: { id: userId } });
        if (!user) {
          return null;
        }
        if (user?.money && user.money < item.price) {
          throw new Error('Shhhit bro, aint got enough cash');
        }

        await ctx.db.user.update({
          where: { username: WEBSHOP_OWNER },
          data: { inventory: { disconnect: { id: item.id } }, money: webshopOwnerHasItem.money + item.price },
        });
        return ctx.db.user.update({
          where: { id: userId },
          data: { inventory: { connect: { id: item.id } }, money: user.money - item.price },
        });
      },
    });

    t.field('sellItem', {
      type: 'User',
      args: { data: arg({ required: true, type: BuyItemArgs, description: 'Input args to request a  purchase' }) },
      resolve: async (_parent, { data: { userId, itemId } }, ctx) => {
        const webshopOwnerHasItem = await ctx.db.user.findOne({
          select: { inventory: true, money: true },
          where: { username: WEBSHOP_OWNER },
        });

        const user = await ctx.db.user.findOne({
          select: { inventory: true, money: true },
          where: { id: userId },
        });

        if (!user?.money || !webshopOwnerHasItem?.money) {
          return null;
        }

        const item = user.inventory.find((item) => item.id === itemId);
        if (!item?.price) {
          throw new Error('You do not own the requested item');
        }

        if (webshopOwnerHasItem.money < item.price) {
          throw new Error('Webshop cannot afford item');
        }

        const userToRet = await ctx.db.user.update({
          where: { id: userId },
          data: { inventory: { disconnect: { id: item.id } }, money: user.money + item.price },
        });
        await ctx.db.user.update({
          where: { username: WEBSHOP_OWNER },
          data: { inventory: { connect: { id: item.id } }, money: webshopOwnerHasItem.money - item.price },
        });
        return userToRet;
      },
    });
  },
});
