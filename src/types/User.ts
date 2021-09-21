import { User, $settings } from 'nexus-prisma';
import { objectType, inputObjectType, extendType } from 'nexus';

export const user = objectType({
  name: User.$name,
  description: User.$description,
  definition(t) {
    t.field(User.id);
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
    t.field('myq', {
      type: 'String',
      resolve: (source, args, context) => {
        context.db.user.findFirst();
        return 'yes';
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
