import { prisma } from '.prisma/client';
import { idArg, nonNull, objectType, extendType, inputObjectType, arg, list, stringArg } from 'nexus';
import { User, UserDetails } from 'nexus-prisma';

export const userDetails = objectType({
  name: UserDetails.$name,
  description: UserDetails.$description,
  definition(t) {
    t.field(UserDetails.id);
    t.field(UserDetails.user);
    t.field(UserDetails.firstName);
    t.field(UserDetails.lastName);
  },
});

export const UserDetailsQueries = extendType({
  type: 'Query',
  definition: (t) => {
    t.field('GetAllUserDetails', {
      type: list('UserDetails'),
      resolve: (source, args, context) => {
        return context.db.userDetails.findMany();
      },
    }),
      t.field('GetUserDetails', {
        type: 'UserDetails',
        args: {
          input: arg({
            type: nonNull(
              inputObjectType({
                name: 'GetUserDetailsInputArgs',
                definition(t) {
                  t.nonNull.id('id');
                },
              }),
            ),
          }),
        },
        resolve: (source, { input: { id } }, context) => {
          return context.db.userDetails.findFirst({
            where: { userId: id },
          });
        },
      });
  },
});

export const UserDetailsInputArgs = inputObjectType({
  name: 'UserDetailsInputArgs',
  definition(t) {
    t.field('user', {
      type: nonNull(
        inputObjectType({
          name: 'UserDetailsInputArgsUser',
          definition(t) {
            t.nonNull.id('id');
          },
        }),
      ),
    }),
      t.string('firstName');
    t.string('lastName');
  },
});

export const UserDetailsMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('userDetailsCreate', {
      type: 'UserDetails',
      args: {
        input: arg({
          type: nonNull(UserDetailsInputArgs),
        }),
      },
      resolve: (
        source,
        {
          input: {
            user: { id: userId },
            firstName,
            lastName,
          },
        },
        context,
      ) => {
        return context.db.userDetails.create({
          data: { firstName, lastName, userId },
        });
      },
    }),
      t.field('userDetailsUpdate', {
        type: 'UserDetails',
        args: {
          input: arg({
            type: nonNull(UserDetailsInputArgs),
          }),
        },
        resolve: async (
          source,
          {
            input: {
              user: { id: userId },
              firstName,
              lastName,
            },
          },
          context,
        ) => {
          const foundUserDetails = await context.db.userDetails.findFirst({ where: { userId } });

          return context.db.userDetails.update({
            where: { id: foundUserDetails?.id },
            data: {
              firstName: firstName,
              lastName: lastName,
            },
          });
        },
      });
    t.field('updateOrCreateUserDetails', {
      type: 'UserDetails',
      args: {
        input: arg({
          type: nonNull(UserDetailsInputArgs),
        }),
      },
      resolve: async (
        source,
        {
          input: {
            user: { id: userId },
            firstName,
            lastName,
          },
        },
        context,
      ) => {
        const foundUserDetails = await context.db.userDetails.findFirst({ where: { userId } });

        if (foundUserDetails === null) {
          return context.db.userDetails.create({
            data: { firstName, lastName, userId },
          });
        } else {
          return context.db.userDetails.update({
            where: { id: foundUserDetails?.id },
            data: {
              firstName: firstName,
              lastName: lastName,
            },
          });
        }
      },
    });
  },
});
//Hello simon
//Hello
