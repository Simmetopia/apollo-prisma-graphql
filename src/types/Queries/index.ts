import { schema } from 'nexus';

export const Query = schema.objectType({
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
