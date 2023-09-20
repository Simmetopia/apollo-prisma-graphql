import { arg, extendType, inputObjectType, nonNull, objectType } from 'nexus';
import { UserDetails } from 'nexus-prisma';

export const userDetails = objectType({
  name: UserDetails.$name,
  description: UserDetails.$description,
  definition(t) {
    t.field(UserDetails.id), t.field(UserDetails.lastName);
  },
});

export const UserUpdateInputArgs = inputObjectType({
  name: 'UserDetailsUpdateArgs',
  definition: (t) => {
    t.string('firstName');
    t.string('lastName');
    t.nonNull.string('id');
  },
});

export const UserDetailsMutations = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('updateUserDetails', {
      type: 'UserDetails',
      args: {
        input: nonNull(arg({ type: 'UserDetailsUpdateArgs' })),
      },
      resolve: async (_, args, context) => {
        return context.db.userDetails.create({
          data: {
            firstName: args.input.firstName,
            lastName: args.input.lastName,
            userId: args.input.id,
          },
        });
      },
    });
  },
});
