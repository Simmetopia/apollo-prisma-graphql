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

export const QueryTypes = [Query];
