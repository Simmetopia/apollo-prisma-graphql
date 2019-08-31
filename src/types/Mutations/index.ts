import { objectType, stringArg } from '@prisma/nexus/dist';

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
