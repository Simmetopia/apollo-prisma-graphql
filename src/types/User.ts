import { extendType, inputObjectType, nonNull, objectType, stringArg } from 'nexus';
import { User } from 'nexus-prisma';

import { pubsub } from '..';

export const user = objectType({
  name: User.$name,
  description: User.$description,
  definition(t) {
    t.field(User.id);
    t.field(User.username);
    t.field(User.money);
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

  definition: (t) => {
    t.nonNull.string('username');
  },
});

export const UserQueries = extendType({
  type: 'Query',
  definition: (t) => {
    t.field('me', {
      type: 'User',
      resolve: async (_source, _args, context) => {
        return context.user;
      },
    });
    t.field('first_user', {
      type: 'User',
      resolve: async (_source, args, context) => {
        return context.db.user.findFirstOrThrow();
      },
    });
    t.field('user', {
      type: 'User',
      args: { id: nonNull(stringArg()) },
      resolve: async (_source, args, context) => {
        return context.db.user.findUnique({
          where: { id: args.id },
        });
      },
    });
  },
});

export const userSubscriptions = extendType({
  type: 'Subscription',
  definition: (t) => {
    t.field('my_money', {
      type: 'Int',
      args: {
        user_id: nonNull(stringArg()),
      },
      subscribe: (_, { user_id }) => {
        const topic = `my_money:${user_id}`;
        return pubsub.asyncIterator([topic, 'items']);
      },
      resolve: (payload: number) => {
        return payload;
      },
    });
  },
});
