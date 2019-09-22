import { random } from 'faker';
import { arg, extendType, inputObjectType, objectType } from 'nexus';

import { WEBSHOP_OWNER } from '../webshop';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id();
    t.model.details();
    t.model.username();
    t.model.inventory();
    t.model.money();
  },
});

const UserAuthType = inputObjectType({
  name: 'UserAuthInput',
  nonNullDefaults: { input: true },
  definition: t => {
    t.string('username', { required: true });
  },
});

const UserQueries = extendType({
  type: 'Query',
  definition: t => {
    t.crud.users();
    t.crud.user();
  },
});

const UserMutations = extendType({
  type: 'Mutation',
  definition: t => {
    t.field('login', {
      type: 'User',
      args: { data: UserAuthType },
      resolve: (_, { data }, ctx) => {
        return ctx.photon.users.findOne({ where: { username: data.username } });
      },
    });

    t.field('signup', {
      type: 'User',
      args: { data: UserAuthType },
      resolve: async (_, { data }, ctx) => {
        try {
          let a = await ctx.photon.users.create({
            data: { username: data.username, money: random.number(200), details: {} },
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
        data: inputObjectType({
          name: 'UserDetailsUpdateArgs',
          definition: t => {
            t.string('firstName');
            t.string('lastName');
            t.id('id', { required: true });
          },
        }),
      },
      resolve: (_, args, ctx) => {
        return ctx.photon.users.update({
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

const BuyItemArgs = inputObjectType({
  name: 'BuyItemArgs',
  nonNullDefaults: { input: true },
  definition: t => {
    t.id('userId', { required: true });
    t.id('itemId', { required: true });
  },
});

const BuyAndSellItems = extendType({
  type: 'Mutation',
  definition: t => {
    t.field('requestPurchase', {
      type: 'User',
      args: { data: arg({ type: BuyItemArgs, description: 'Input args to request a  purchase' }) },
      resolve: async (_parent, { data: { userId, itemId } }, ctx) => {
        const webshopOwnerHasItem = await ctx.photon.users
          .findOne({ where: { username: WEBSHOP_OWNER } })
          .inventory({ where: { id: itemId } });
        console.log(webshopOwnerHasItem);
        if (webshopOwnerHasItem.length !== 1) {
          throw new Error('Webshop does not own requested item');
        }
        // TODO Whaat, no money invovled? Watto does not like to give out things for free!
        await ctx.photon.users.update({
          where: { username: WEBSHOP_OWNER },
          data: { inventory: { disconnect: { id: webshopOwnerHasItem[0].id } } },
        });
        return ctx.photon.users.update({
          where: { id: userId },
          data: { inventory: { connect: { id: webshopOwnerHasItem[0].id } } },
        });
      },
    });
  },
});

export const UserGraph = [BuyAndSellItems, User, UserQueries, UserMutations];
