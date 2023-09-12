import bcrypt from 'bcrypt';
import { arg, extendType, inputObjectType, nonNull, objectType } from 'nexus';
import { User } from 'nexus-prisma';

export const user = objectType({
  name: User.$name,
  description: User.$description,
  definition(t) {
    t.field(User.id);
    t.field(User.username);
    t.field(User.money);
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

export const UserQueries = extendType({
  type: 'Query',
  definition: (t) => {
    t.field('first_user', {
      type: nonNull('User'),
      resolve: async (source, args, context) => {
        return context.db.user.findFirstOrThrow();
      },
    });
  },
});

export const UserAuthType = inputObjectType({
  name: 'UserAuthInput',

  definition: (t) => {
    t.nonNull.string('username');
    t.nonNull.string('password');
  },
});

// Verify a password using bcrypt
async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
export const UserMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('login', {
      type: 'User',
      args: {
        input: nonNull(arg({ type: 'UserAuthInput' })),
      },
      resolve: async (source, { input }, context) => {
        // Find the user by username
        const user = await context.db.user.findFirstOrThrow({
          where: { username: input?.username },
        });

        const passwordMatch = await verifyPassword(input.password, user.password);

        if (!passwordMatch) {
          throw new Error('Invalid password');
        }
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
