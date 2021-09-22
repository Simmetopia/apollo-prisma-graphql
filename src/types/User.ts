import { User, $settings } from 'nexus-prisma';
import { objectType, inputObjectType, extendType, arg, nonNull, stringArg, list } from 'nexus';
import { resolve } from 'path/posix';
import { NotFound } from 'http-errors';
import { prisma } from '.prisma/client';
import { AuthenticationError } from 'apollo-server-errors';

// function UserNotFoundError(message = "") {
//   this.name = "UserNotFoundError";
//   this.message = message;
// }
//UserNotFoundError.prototype = Error.prototype

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
    t.field("users", {
      type: nonNull(list(nonNull('User'))),
      resolve: (source, args, ctx) => {
        return ctx.db.user.findMany();
      },
    });
  },
});

export const UserMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('userCreate', {
      type: 'User',
      args: {username: nonNull(stringArg())},
      resolve: async(source, {username}, ctx) => {
        
        const user = await ctx.db.user.findFirst( {where: {username} });

        if(user)
        {
          throw new AuthenticationError("Username already in use" )
        }
        
        return await ctx.db.user.create({data: {username, money:200}})
      }
    });
    t.field('userLogin', {
      type: 'User',
      args: {username: nonNull(stringArg())},
      resolve: async (source, {username}, ctx) => {

        const user = await ctx.db.user.findFirst( {where: {username} });

        if(!user)
        {
          throw new AuthenticationError("User not found: " + username )
        }

        return user;
      }
    })
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
