import { User, $settings } from 'nexus-prisma';
import { objectType, inputObjectType, extendType, nonNull, stringArg, list, arg, idArg } from 'nexus';
import { AuthenticationError } from 'apollo-server-errors';

export const user = objectType({
  name: User.$name,
  description: User.$description,
  definition(t) {
    t.field(User.id);
    t.field(User.username);
    t.field(User.details);
    t.field(User.inventory);
  },
});

export const UserUpdateInputArgs = inputObjectType({
  name: 'UserDetailsUpdateArgs',
  definition: (t) => {
    t.string('firstName');
    t.string('lastName');
    t.id('id');
  },
});

export const UserAuthType = inputObjectType({
  name: 'UserAuthInput',
  nonNullDefaults: { input: true },
  definition: (t) => {
    t.string('username');
  },
});

export const UserQueries = extendType({
  type: 'Query',
  definition: (t) => {
    t.field('GetUsersList', {
      type: list('User'),
      resolve: (source, args, context) => {
        return context.db.user.findMany();
      },
    });
    t.field('GetUser', {
      type: 'User',
      args: {
        input: arg({
          type: nonNull(
            inputObjectType({
              name: 'GetUserInputArgs',
              definition(t) {
                t.nonNull.id('id');
              },
            }),
          ),
        }),
      },
      resolve: (source, { input: { id } }, context) => {
        return context.db.user.findFirst({
          where: { id: id },
        });
      },
    });
    t.field('GetUserByUsername', {
      type: 'User',
      args: {
        input: arg({
          type: nonNull(
            inputObjectType({
              name: 'GetUserByUsernameInputArgs',
              definition(t) {
                t.nonNull.string('username');
              },
            }),
          ),
        }),
      },
      resolve: async (source, { input: { username } }, context) => {
        const user = await context.db.user.findFirst({
          where: { username: username },
        });
        if (!user) throw new AuthenticationError('User not found my dude');
        return user;
      },
    });
  },
});

export const BuyItemArgs = inputObjectType({
  name: 'BuyItemArgs',
  nonNullDefaults: { input: true },
  definition: (t) => {
    t.id('userId');
    t.id('itemId');
  },
});

export const BuyAndSellItems = extendType({
  type: 'Mutation',
  definition(t) {},
});

export const UserMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('userCreate', {
      type: 'User',
      args: {
        input: arg({
          type: nonNull(
            inputObjectType({
              name: 'UserCreateInputArgs',
              definition(t) {
                t.nonNull.string('username');
              },
            }),
          ),
        }),
      },
      resolve: async (source, { input: { username } }, context) => {
        const user = await context.db.user.findFirst({
          where: { username: username },
        });
        if (user === null) {
          return await context.db.user.create({
            data: { username: username, money: 999 },
          });
        } else {
          throw new AuthenticationError('User already exits my dude');
        }
      },
    });
    t.field('buyItem', {
      type: 'Item',
      args: {
        input: nonNull(
          arg({
            type: BuyItemArgs,
          }),
        ),
      },
      resolve: async (souce, { input: { itemId, userId } }, context) => {
        await context.db.$transaction(async (prisma) => {
          const item = await prisma.item.findFirst({
            where: {
              id: itemId,
            },
          });

          const currentOwner = item?.userId;

          const user = await prisma.user.update();
        });
      },
    });
  },
});
