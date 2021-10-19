import { ApolloError } from 'apollo-server-errors';
import { withFilter } from 'apollo-server-express';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { extendType, inputObjectType, list, nonNull, objectType, stringArg } from 'nexus';
import { User } from 'nexus-prisma';

export const user = objectType({
  name: User.$name,
  description: User.$description,
  definition(t) {
    t.field(User.id);
    t.field(User.username);
    t.field(User.inventory);
    t.field(User.money);
    t.field(User.cart);
    t.string('token');
  },
});

export const login = objectType({
  name: 'Login',
  definition(t) {
    t.id('id');
    t.field('username', { type: 'String' });
    t.string('token');
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

interface MoneyPayload {
  userId: string;
}

export const UserSubscriptions = extendType({
  type: 'Subscription',
  definition(t) {
    t.int('userMoney', {
      subscribe: withFilter(
        (source, args, ctx) => {
          return ctx.pubSub.asyncIterator(['USER_MONEY']);
        },
        (payload: MoneyPayload, args, ctx) => {
          return payload.userId == ctx.user?.id;
        },
      ),
      resolve: async (payload: MoneyPayload, args, ctx) => {
        const user = await ctx.db.user.findFirst({ where: { id: payload.userId } });

        return user!.money;
      },
    });
  },
});

export const UserQueries = extendType({
  type: 'Query',
  definition: (t) => {
    t.field('users', {
      type: nonNull(list(nonNull('User'))),
      resolve: (source, args, ctx) => {
        return ctx.db.user.findMany();
      },
    });
    t.field('userDetails', {
      type: 'User',
      resolve: async (source, args, ctx) => {
        ctx.pubSub.publish('USER_MONEY', { userId: ctx.user?.id.toString() });
        return await ctx.db.user.findFirst({ where: { id: ctx.user?.id.toString() } });
      },
    });
    t.field('userCart', {
      type: nonNull(list(nonNull('Item'))),
      resolve: async (source, args, ctx) => {
        const user = await ctx.db.user.findFirst({ where: { id: ctx.user?.id.toString() }, include: { cart: true } });
        return user?.cart!;
      },
    });
  },
});

export const UserMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('userCreate', {
      type: nonNull('Login'),
      args: {
        username: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve: async (source, { username, password }, ctx, {}) => {
        const anyUser = await ctx.db.user.findFirst({ where: { username } });

        if (anyUser) {
          throw new ApolloError('Username already in use');
        }

        const user = await ctx.db.user.create({
          data: {
            password: await hash(password, 12),
            username,
            money: 200,
          },
        });

        return {
          token: await sign({ userId: user.id }, process.env.SECRET!, { expiresIn: '60m' }),
          username: user.username,
          id: user.id,
        };
      },
    });
    t.field('userLogin', {
      type: nonNull('Login'),
      args: {
        username: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },

      resolve: async (source, { username, password }, ctx) => {
        const user = await ctx.db.user.findFirst({ where: { username }, include: { inventory: true } });

        if (!user || !(await compare(password.toLowerCase(), user.password.toLowerCase()))) {
          throw new ApolloError('Invalid username/password');
        }

        return {
          token: await sign({ userId: user.id }, process.env.SECRET!, { expiresIn: '30m' }),
          username: user.username,
          id: user.id,
        };
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
