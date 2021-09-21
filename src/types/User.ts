import { User, $settings } from 'nexus-prisma';
import { objectType, inputObjectType, extendType, nonNull, stringArg, list, idArg } from 'nexus';

export const user = objectType({
  name: User.$name,
  description: User.$description,
  definition(t) {
    t.field(User.id);
    t.field(User.username);
    t.field(User.details);
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
    t.field("GetUser", {
      type: "User",
      args: {id:nonNull(idArg())},
      resolve: (source, args, context) => {
        return context.db.user.findFirst({
          where: {id:args.id}
        });
      }
    })
  },
});



export const UserMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field("userCreate", {
      type: "User",
      args: {username: nonNull(stringArg())},
      resolve: (source, args, context) => {
        return context.db.user.create(
          {
            data: {username:args.username, money:999}
          })
      }
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
