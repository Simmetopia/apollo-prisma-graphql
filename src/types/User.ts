import { extendType, inputObjectType, objectType } from 'nexus';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id();
    t.model.details();
    t.model.purchases({ type: 'Transaction' });
    t.model.sells({ type: 'Transaction' });
    t.model.username();
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
      resolve: (_, { data }, ctx) => {
        return ctx.photon.users.create({ data: { username: data.username, details: {} } });
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

export const UserGraph = [User, UserQueries, UserMutations];
