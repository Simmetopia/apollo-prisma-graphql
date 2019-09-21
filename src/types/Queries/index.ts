import { extendType, objectType } from 'nexus';

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
    t.crud.transactions({ pagination: true, filtering: true, ordering: true });
    t.crud.items();
  },
});

export const QueryTypes = [Query, userQueries];
