import { hash, verify } from 'argon2';
import { datatype } from 'faker';
import { sign } from 'jsonwebtoken';
import { extendType, inputObjectType, nonNull, objectType } from 'nexus';

const omega_token_secret = process.env.JWT_SECRET || 'omega_token_secret';
export const AuthInputObject = inputObjectType({
  name: 'AuthInputObject',
  definition: (t) => {
    t.nonNull.string('username');
    t.nonNull.string('password');
  },
});

export const AuthObejct = objectType({
  name: 'AuthObject',
  definition: (t) => {
    t.nonNull.string('token');
    t.nonNull.field('user', { type: 'User' });
  },
});

export const mutations = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('login', {
      type: 'AuthObject',
      args: { auth: nonNull(AuthInputObject) },
      resolve: async (source, args, context) => {
        const user = await context.db.user.findUniqueOrThrow({
          where: { username: args.auth.username },
        });

        const valid = await verify(user.password, args.auth.password);

        if (!valid) {
          throw new Error('Invalid login credentials');
        }

        return { user, token: sign({ user }, omega_token_secret) };
      },
    });
    t.field('register', {
      type: 'AuthObject',
      args: { auth: nonNull(AuthInputObject) },
      resolve: async (source, args, context) => {
        const user = await context.db.user.create({
          data: {
            username: args.auth.username,
            password: await hash(args.auth.password),
            money: datatype.number(350),
          },
        });

        return { user, token: sign({ user }, omega_token_secret) };
      },
    });
  },
});
