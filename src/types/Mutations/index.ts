import { objectType, stringArg } from '@prisma/nexus/dist';

export const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    t.field('CreateUser', {
      type: 'User',
      args: { userName: stringArg({ required: true }) },
      resolve: (_, args, ctx) => {
        return ctx.photon.users.create({ data: { username: args.userName, details: {} } });
      },
    });
  },
});
