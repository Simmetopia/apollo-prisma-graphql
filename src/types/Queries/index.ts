import { extendType, objectType } from '@prisma/nexus/dist';

const Query = objectType({
  name: 'Query',
  definition(t) {
    t.field('_unsued', {
      deprecation: 'root query type',
      type: 'String',
      resolve: () => 'unsued',
    });
  },
});

export const userQueries = extendType({
  type: 'Query',
  definition(t) {
    t.field('GetUsers', {
      list: true,
      type: 'User',
      resolve: (_, __, ctx) => ctx.photon.users.findMany(),
    });
  },
});

export const QueryTypes = [Query, userQueries];
