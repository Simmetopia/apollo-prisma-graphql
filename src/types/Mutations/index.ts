import { objectType, stringArg } from 'nexus';

export const Mutation = objectType({
  name: 'Mutation',
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
