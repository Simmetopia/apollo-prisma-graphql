import { extendType, inputObjectType, nonNull, objectType, stringArg } from 'nexus';
import { User } from 'nexus-prisma';

export const user = objectType({
  name: User.$name,
  description: User.$description,
  definition(t) {
    t.field(User.id);
    t.field(User.username);
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

  definition: (t) => {
    t.nonNull.string('username');
  },
});

export const UserQueries = extendType({
  type: 'Query',
  definition: (t) => {
    t.field('first_user', {
      type: 'User',
      resolve: async (source, args, context) => {
        return context.db.user.findFirstOrThrow();
      },
    }),
      t.list.field('getAllUserItemsById', {
        type: 'Item',
        args: {
          input: nonNull(stringArg()),
        },
        resolve: async (source, args, context) => {
          return context.db.user.findUnique({ where: { id: args.input } }).inventory();
        },
      });
  },
});

export const UserMutations = extendType({
  type: 'Mutation',
  definition(t) {},
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
