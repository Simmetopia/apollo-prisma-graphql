import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { arg, extendType, inputObjectType, list, nonNull, objectType } from 'nexus';
import { User } from 'nexus-prisma';

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

export const UserQueries = extendType({
  type: 'Query',
  definition: (t) => {
    t.field('first_user', {
      type: nonNull('User'),
      resolve: async (source, args, context) => {
        return context.db.user.findFirstOrThrow();
      },
    });
    t.field('users', {
      type: nonNull(list(nonNull('User'))),
      resolve: async (source, args, context) => {
        return context.db.user.findMany();
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

export const UserTypes = objectType({
  name: 'UserWithToken',
  definition(t) {
    t.field('user', { type: 'User' });
    t.string('token');
  },
});

// Verify a password using bcrypt
async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
export const omega_token_secret = process.env.JWT_SECRET || 'omega_token_secret';
export const UserMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('login', {
      type: 'UserWithToken',
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

        const token = sign({ sub: user.id }, omega_token_secret, {
          expiresIn: '12h',
        });

        return {
          user,
          token,
        };
      },
    });

    t.field('Signup', {
      type: 'User',
      args: {
        input: nonNull(
          arg({
            type: 'UserAuthInput',
          }),
        ),
      },
      resolve: async (source, { input }, context) => {
        const hashedPassword = await bcrypt.hash(input.password, 12);

        const user = await context.db.user.create({
          data: {
            username: input.username,
            password: hashedPassword,
            money: 21000,
          },
        });
        return user;
      },
    });
  },
});

export const BuyItemArgs = inputObjectType({
  name: 'BuyItemArgs',
  nonNullDefaults: { input: true },
  definition: (t) => {
    t.string('sellerId');
    t.string('itemId');
  },
});

export const BuyAndSellItems = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('purchaseItem', {
      type: 'User',
      args: {
        input: nonNull(arg({ type: 'BuyItemArgs' })),
      },
      resolve: async (source, { input }, context) => {
        return purchaseItem(input.sellerId, context.user.id, input.itemId, context.db);
      },
    });
  },
});

async function purchaseItem(seller: string, buyer: string, itemId: string, db: PrismaClient) {
  return await db.$transaction(async (tx) => {
    const item = await tx.item.findFirstOrThrow({ where: { id: { equals: itemId } } });
    const user_buyer = await tx.user.findFirstOrThrow({ where: { id: { equals: buyer } } });

    if (item.userId === user_buyer.id) {
      throw new Error('User already owns this item');
    }

    // Decrement money from the buyer and add item to userid
    const to = await tx.user.update({
      data: {
        money: {
          decrement: item.price,
        },
        inventory: { connect: { id: item.id } },
      },
      where: {
        id: user_buyer?.id,
      },
    });

    // Validate buyer has enough money
    if (to.money < 0) {
      throw new Error('Not enough money');
    }

    // Increment balance of seller
    const from = await tx.user.update({
      data: {
        money: {
          increment: item.price,
        },
      },
      where: {
        id: seller,
      },
    });

    // Return buyer
    return to;
  });
}
