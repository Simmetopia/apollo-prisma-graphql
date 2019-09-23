import { objectType } from 'nexus';

export const Query = objectType({
  name: 'Query',
  definition(t) {
    t.field('_deprecated_field', {
      type: 'String',
      deprecation: 'This is the root type',
      resolve: () => {
        return 'Unused';
      },
    });
  },
});

